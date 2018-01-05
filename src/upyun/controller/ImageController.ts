import { Controller, Get , Post, Request , Response , Body ,Param, Headers , Query} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiUseTags, ApiResponse, ApiOperation, ApiConsumes, ApiProduces, ApiImplicitBody} from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { RestfulService } from '../service/RestfulService';
import { ConfigService } from '../service/ConfigService';
import { ImageService } from '../service/ImageService';
import { AuthUtil } from '../util/AuthUtil'
import { Image } from '../model/Image';
import { Config} from '../model/Config';
import { UploadBody } from '../interface/image/UploadBody'
import { ImageBody } from '../interface/image/ImageBody'
import { ImagesBody } from '../interface/image/ImagesBody'
import { DeleteQuery } from '../interface/image/DeleteQuery'


/*图片控制器，包含了图片上传处理、异步回调通知、获取单张图片、获取多张图片控制器
*/
@ApiUseTags('Image')
@Controller('upyun/image')
export class ImageController {


  constructor(
    private readonly authUtil: AuthUtil,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
    private readonly restfulService: RestfulService,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Config) private readonly configRepository: Repository<Config>) {}

  /*图片上传处理接口
    @Param isPublic：上传空间是否是公有空间
    @Param contentMd5：上传文件的md5值
    @Param contentSecret：文件访问密钥
    @Param contentName：文件名
    @Return data.code：状态码，200为成功，400、401、402、403、404为错误
            data.message：响应信息
            data.baseUrl：上传时的基本url
            data.method：上传方法
            data.form：表单上传的字段对象，包含了policy、authorization字段，上传时需要加上file字段
  */
  @Post('upload')
  @ApiOperation({title:'上传预处理接口，获取上传图片的路径、方法、字段'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:420,description:'md5值不正确，应为32位'})
  @ApiResponse({status:421,description:'公有空间配置不存在'})
  @ApiResponse({status:422,description:'私有空间配置不存在'})
  @ApiResponse({status:423,description:'格式配置不正确'})
  @ApiResponse({status:424,description:'图片已存在'})
  @ApiResponse({status:425,description:'图片保存失败'})
  async uploadProcess(@Body() body:UploadBody,@Request() req):Promise<any>{

    let data = {
      code:200,
      message:'',
      baseUrl:'http://v0.api.upyun.com',
      method:'post',
      form:{
        policy:'',
        authorization:''
      }
    }

    let {isPublic,contentMd5,contentSecret,contentName} = body

    let policy  = {
      'bucket':'',
      'save-key':'',
      'expiration':null,
      'date':'',
      'content-md5':contentMd5,
      'notify-url':'http://upyuns.frp2.chuantou.org/upyun/image/notify',
      //图片生存期限默认为180天
      'x-upyun-meta-ttl':180
    }  

    if(isPublic === null || isPublic===undefined || !contentMd5|| !contentName){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    if(contentMd5.length!==32){
      data.code = 420
      data.message = 'contentMd5参数不正确'
      return data
    }

    let config:Config 
    if(isPublic){
      config = await this.configService.getPublicConfig()
      if(!config){
        data.code = 421
        data.message = '公有空间配置不存在'
        return data
      }
    }else{
      config = await this.configService.getPrivateConfig()
      if(!config){
        data.code = 422
        data.message = '私有空间配置不存在'
        return data
      }
    }


    //获取后台配置，创建上传参数
    await this.imageService.makePolicy(data,policy,config,contentMd5,contentSecret,contentName)
    //格式配置不正确
    if(data.code == 423){
      return data
    }

    //预保存图片，保存原图save-key
    await this.imageService.preSaveImage(data,policy,config,contentName)

    //图片已存在、图片保存失败
    if(data.code == 424 || data.code == 425){
      return data
    }
    return data
  }


  /* 异步回调通知接口
     @Param code：响应码，200代表文件上传成功，其他为失败
     @Param message：响应信息
     @Param url：文件保存路径，按照官方文档推断，应该不包含bucket，不包含目录说不过去了
     @Param task_ids：预处理结果
  */
  @Post('notify')
  async asyncNotify(@Body() body,@Request() req,@Headers() headers):Promise<any>{
    let content_type = headers['content-type']
    let contentMd5 = headers['content-md5']
    let auth = headers['authorization']
    let date = headers['date']
    console.log(body)
    //接收到默认MIME类型，说吗是上传回调
    if(content_type==='application/x-www-form-urlencoded'){
      let code = +body.code
      let save_key = body.url.substr(0,body.url.lastIndexOf('.'))
      //查找对应图片,此时图片应为预保存状态
      let image:Image = await this.imageRepository.findOne({save_key,status:'pre'})
      //找不到指定状态图片
      //莫要不存在save_key，基本不可能，因为这个接口只会被回调调用，肯定有预保存
      //要么状态为post，那么说吗图片以及被回调保存过了，这种也基本不可能，如果存在post状态图片，在预保存时就会返回错误码
      //但是判断还是有必要
      if(!image){
        return
      }
      //根据服务名查找配置
      let config:Config = await this.configRepository.findOne({bucket:image.bucket})
      if(!config){
        await this.imageService.postDeleteImage(save_key,image.bucket,image.status)
        return
      }
      //对上传回调进行验签
      let pass =  await this.authUtil.notifyVerify(auth,config,'POST','/upyun/image/notify',date,contentMd5,body)
      //验签失败，这种情况是破坏性的，此时图片没有后保存，但是客户端可能已经得到图片上传响应信息
      //无法通知客户端，这种情况下，如果不删除预保存的数据，就只能等客户端再次请求auth或者再次上传图片，等待新的回调，但是如果没有，那么这个图片应该不会被显示
      //如果删除预保存图片，下次客户端如果从获取auth开始就没问题，如果从上传开始，那么就可能出现云存储上的死资源，因为本地没保存路径
      //暂定在验签失败时，先保存预保存数据
      if(!pass){
        console.log('验签失败')
        await this.imageService.postDeleteImage(save_key,image.bucket,image.status)
        return
      }
      //上传失败，只需要删除本地存储信息
      if(code!==200){
        //上传失败删除预保存信息
        await this.imageService.postDeleteImage(save_key,image.bucket,image.status)
        return
      }
      //如果保存格式为原图
      if(config.format==='raw'){
        //直接根据上传回调信息更新数据库
        await this.imageService.postSaveImage(config,body)
      }
      //如果不是保存为原图
      else{
        //则这个上传回调信息无效
      }
      return
    }
    //如果请求MIME为json类型，说吗为异步预处理回调信息
    else if(content_type==='application/json'){
      let code = body.status_code
      let {bucket_name:bucket} = body
      let path = body.imginfo.path
      let save_key = path.substr(0,path.lastIndexOf('.'))
    
      //查找对应图片,此时图片应为预保存状态
      let image:Image = await this.imageRepository.findOne({save_key,bucket,status:'pre'})
      //找不到指定状态图片
      //莫要不存在save_key，基本不可能，因为这个接口只会被回调调用，肯定有预保存
      //要么状态为post，那么说吗图片以及被回调保存过了，这种也基本不可能，如果存在post状态图片，在预保存时就会返回错误码
      //但是判断还是有必要
      if(!image){
        console.log('图片不存在')
        return
      }
      //根据服务名查找配置
      let config:Config = await this.configRepository.findOne({bucket})
      if(!config){
        await this.imageService.postDeleteImage(save_key,bucket,image.status)
        return
      }
      //对异步预处理任务请求进行验签。此时请求体为json字符串
      let pass =  await this.authUtil.taskNotifyVerify(auth,config,'POST','/upyun/image/notify',date,contentMd5,body)
      if(!pass){
        await this.imageService.postDeleteImage(save_key,bucket,image.status)
        return
      }
      if(code!==200){
        //上传失败删除预保存信息
        await this.imageService.postDeleteImage(save_key,bucket,image.status)
        return
      }
      //上传成功，使用预处理结果更新数据库
      let rawPath = await this.imageService.postSaveTaskResult(config,body,save_key)
      //删除云存储上原图
      await this.restfulService.deleteFile({code:200,message:''},config,rawPath)
    }
    return
  }


  /* 获取单张图片url方法 */
  @Post('image')
  @ApiOperation({title:'获取单张图片url接口，包括CDN域名、save_key、token、文件密钥、处理字符串'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:421,description:'公有空间配置不存在'})
  @ApiResponse({status:422,description:'私有空间配置不存在'})
  @ApiResponse({status:426,description:'指定图片不存在'})
  @ApiResponse({status:427,description:'图片查找失败'})
  @ApiResponse({status:428,description:'图片不在空间中'})
  @ApiResponse({status:429,description:'比例参数不正确'})
  @ApiResponse({status:430,description:'宽度比例参数不正确'})
  @ApiResponse({status:431,description:'高度比例参数不正确'})
  @ApiResponse({status:432,description:'宽高参数不正确'})
  @ApiResponse({status:433,description:'宽度参数不正确'})
  @ApiResponse({status:434,description:'高度参数不正确'})
  @ApiResponse({status:435,description:'像素参数不正确'})
  @ApiResponse({status:436,description:'缩放模式不正确'})
  @ApiResponse({status:437,description:'裁剪顺序不正确'})
  @ApiResponse({status:438,description:'裁剪重心不正确'})
  @ApiResponse({status:439,description:'裁剪宽高不正确'})
  @ApiResponse({status:440,description:'x参数不正确'})
  @ApiResponse({status:441,description:'y参数不正确'})
  @ApiResponse({status:442,description:'圆角参数不正确'})
  @ApiResponse({status:443,description:'水印参数不正确'})
  @ApiResponse({status:444,description:'水印图片url不存在'})
  @ApiResponse({status:445,description:'水印重心参数不正确'})
  @ApiResponse({status:446,description:'偏移参数不正确'})
  @ApiResponse({status:447,description:'透明度参数不正确'})
  @ApiResponse({status:448,description:'短边自适应参数不正确'})
  @ApiResponse({status:449,description:'旋转角度不正确'})
  @ApiResponse({status:450,description:'模糊半径不正确'})
  @ApiResponse({status:451,description:'模糊标准差不正确'})
  @ApiResponse({status:452,description:'锐化参数不正确'})
  @ApiResponse({status:453,description:'格式参数不正确'})
  @ApiResponse({status:454,description:'图片质量参数不正确'})
  @ApiResponse({status:455,description:'渐进参数不正确'})
  @ApiResponse({status:456,description:'去除元信息参数不正确'})
  async  getImage(@Body() body:ImageBody):Promise<any>{
    let data = {
      code:200,
      message:"",
      url:''
    }
    //请求体中需要指出图片save_key，是否在公有空间
    let {save_key,isPublic} = body

    if(!save_key || (isPublic===null||isPublic===undefined)){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    let config:Config 
    if(isPublic){
      config = await this.configService.getPublicConfig()
      if(!config){
        data.code = 421
        data.message = '公有空间配置不存在'
        return data
      }
    }else{
      config = await this.configService.getPrivateConfig()
      if(!config){
        data.code = 422
        data.message = '私有空间配置不存在'
        return data
      }
    }

    let image:Image
    try{
      image = await  this.imageRepository.findOne({save_key,bucket:config.bucket,status:'post'})
      if(image == null){
        data.code = 426
        data.message = '指定图片不存在'
        return  data
      }
    }catch(err){
        data.code = 427
        data.message = '图片查找失败'
        return data
    }

    //创建获取图片的完整url，包括基本url、空间名、save_key、访问token(如果是私有空间图片)、分隔符、访问密钥、处理字符串
    await this.imageService.makeUrl(data,config,image,body)
    if(data.code !== 200){
      return data
    }
    return  data
  }


  /* 暂定获取整个空间图片，分页获取 */
  @Post('images')
  @ApiOperation({title:'分页获取图片信息列表'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:421,description:'公有空间配置不存在'})
  @ApiResponse({status:422,description:'私有空间配置不存在'})
  @ApiResponse({status:457,description:'参数不正确'})
  @ApiResponse({status:458,description:'查询出现错误'})
  async  images(@Body() body:ImagesBody):Promise<any>{
     let data  = {
       code:200,
       message:'',
       baseUrl:'',
       total:null,
       images:[],
       urls:[]
     }
     //当前页数、每页条目数
     let {isPublic,page,pageSize} = body
     if(isPublic === undefined || page===undefined ||  !pageSize===undefined){
       data.code = 400
       data.message = '缺少参数'
       return data
     }

     if((isPublic!==true&&isPublic!==false)|| !Number.isInteger(page) || !Number.isInteger(pageSize)){
      data.code = 457
      data.message = '参数不正确'
      return data
     }

     let config:Config 
     if(isPublic){
       config = await this.configService.getPublicConfig()
       if(!config){
         data.code = 421
         data.message = '公有空间配置不存在'
         return data
       }
     }else{
       config = await this.configService.getPrivateConfig()
       if(!config){
         data.code = 422
         data.message = '私有空间配置不存在'
         return data
       }
     }

     data.baseUrl = config.base_url
     let results:Image[]
     try{
        results= await this.imageRepository
        .createQueryBuilder("image")
        .where('image.bucket=:param1')
        .orderBy("image.id", "DESC")
        .offset((page-1)*pageSize)
        .limit(pageSize)
        .setParameters({ param1: config.bucket})
        .getMany()
        data.code = 200
        data.message = '查询图片成功'
        data.total = await this.imageRepository.count({bucket:config.bucket})
        data.images = results
     }catch(err){
        data.code = 458
        data.message = '查询出现错误'
        data.total = null
        data.images = null
        return data
     }

     if(isPublic){
        data.images.forEach((value,index)=>{
          data.urls[index] = value.save_key+'.'+value.type
          if(value.content_secret){
            data.urls[index]+='!'+value.content_secret
          }
        })
     }else{
      data.images.forEach(async (value,index)=>{
        data.urls[index] = value.save_key+'.'+value.type+'?_upt='+await this.authUtil.getToken(config,value.save_key+'.'+value.type)
        if(value.content_secret){
          data.urls[index]+='!'+value.content_secret
        }
      })
     }
     return data

  }

   /* 文件删除接口
     当客户端需要删除某个文件时使用，由于目前只有两个空间，每个空间目录唯一，则只需传递save-key的不包含目录部分、是否为公有空间即可确定文件
   */
  @ApiOperation({title:'删除指定图片接口'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:421,description:'公有空间配置不存在'})
  @ApiResponse({status:422,description:'私有空间配置不存在'})
  @ApiResponse({status:457,description:'参数不正确'})
  @ApiResponse({status:458,description:'查询出现错误'})
  @Get('delete')
  async deleteFile(@Query() query:DeleteQuery,@Response() res):Promise<any>{
      let data = {
          code : 200,
          message:''
      }
      let {isPublic,save_key} = query
      let config:Config 
      if(isPublic){
        config = await this.configService.getPublicConfig()
        if(!config){
          data.code = 421
          data.message = '公有空间配置不存在'
          return data
        }
      }else{
        config = await this.configService.getPrivateConfig()
        if(!config){
          data.code = 422
          data.message = '私有空间配置不存在'
          return data
        }
      }
      let image:Image = await this.imageRepository.findOne({save_key,bucket:config.bucket,status:'post'})
      await this.restfulService.deleteFile(data,config,save_key+'.'+image.type)
      //删除文件失败
      if(data.code == 460){
          return data
      }
      return data
  }
}