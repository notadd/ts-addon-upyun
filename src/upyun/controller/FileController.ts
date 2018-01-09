import { ApiUseTags, ApiResponse, ApiOperation, ApiConsumes, ApiProduces, ApiImplicitBody} from '@nestjs/swagger';
import { Controller, Get , Post, Request , Response , Body ,Param, Headers , Query} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,SelectQueryBuilder} from 'typeorm';
import { ConfigService } from '../service/ConfigService';
import { FileService } from '../service/FileService';
import { RestfulUtil } from '../util/RestfulUtil';
import { KindUtil } from '../util/KindUtil'
import { AuthUtil } from '../util/AuthUtil'
import { Document } from '../model/Document'
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio'
import { Video } from '../model/Video'
import { Image } from '../model/Image';
import { File } from '../model/File'
import { DownloadProcessBody } from '../interface/file/DownloadProcessBody'
import { UploadProcessBody } from '../interface/file/UploadProcessBody'
import { FileBody } from '../interface/file/FileBody'
import { FilesBody } from '../interface/file/FilesBody'
import { DeleteFileBody } from '../interface/file/DeleteFileBody'
const formidable = require('formidable')
const path = require('path')
/*文件控制器，包含了文件上传、下载处理、异步回调通知、获取单个文件、获取多个文件
  文件的上传、下载，目录的创建、删除等接口
  所有文件接口只接受json类型请求体，post请求方法
*/
@ApiUseTags('File')
@Controller('upyun/file')
export class FileController {

  constructor(
    private readonly authUtil: AuthUtil,
    private readonly kindUtil: KindUtil,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
    private readonly restfulUtil: RestfulUtil,
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    }

    /* 文件下载预处理接口
     当客户端需要下载某个文件时使用，文件不经过服务器，直接由客户端从云存储下载
     返回下载文件的方法、url、参数、头信息(包含了签名)
     @Param bucket_name：文件所属空间名
     @Param type：       上传文件扩展名，即文件类型
     @Param md5：        文件的md5值，下载之前应该向服务器获取文件信息
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.baseUrl：下载时的基本url
             data.method： 下载方法
             data.headers：下载文件时的头信息，包含了日期、签名
  */
  @ApiOperation({title:'下载图片预处理接口'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'指定空间不存在'})
  @ApiResponse({status:402,description:'指定文件不存在'})
  @Post('downloadProcess')
  async downloadProcess(@Body() body:DownloadProcessBody):Promise<any>{
      let data = {
        code:200,
        message:'',
        baseUrl:'http://v0.api.upyun.com',
        //下载文件使用get方法
        method:'get',
        headers:{
          //头信息中签名
          authorization:'',
          //GMT格式字符串
          date:''
        }
      }
      let {bucket_name,md5,type} =body
      if(!bucket_name|| !md5){
        data.message = '缺少参数'
        return data
      }
      //一般查询方法不加try...catch
      let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
      //指定空间不存在
      if(!bucket){
        data.code = 401
        data.message = '指定空间'+bucket_name+'不存在'
        return
      }
      let kind
      let status = 'post'
      let file:File|Audio|Video|Image|Document
      if(this.kindUtil.isImage(type)){
        file = await this.imageRepository.findOne({md5,type})
      }else{

      }
      if(!file){
        data.code = 402
        data.message = '指定文件不存在'
        return data
      }
      data.baseUrl += '/'+bucket.name+'/'+bucket.directory
      data.baseUrl+='/'+file.md5+'.'+file.type
      data.headers.date = new Date(+new Date()+bucket.request_expire*1000).toUTCString()
      data.headers.authorization = await this.authUtil.getHeaderAuth(bucket,'GET',data.baseUrl.replace('http://v0.api.upyun.com',''),data.headers.date,'')
      return data
    }


  /*文件表单上传预处理接口
    @Param bucket_name：上传空间名
    @Param md5：        上传文件的md5值
    @Param contentName：文件名，必选，从其中获取文件类型
    @Param contentSecret：文件访问密钥，可选
    @Return data.code：状态码，200为成功，其他为错误
            data.message：响应信息
            data.baseUrl：上传时的基本url
            data.method： 上传方法
            data.form：   表单上传的字段对象，包含了policy、authorization字段，上传时需要加上file字段
  */
  @Post('uploadProcess')
  @ApiOperation({title:'上传预处理接口，获取上传文件的路径、方法、字段'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数或者参数不正确'})
  @ApiResponse({status:401,description:'指定空间不存在'})
  @ApiResponse({status:402,description:'文件类型不存在'})
  @ApiResponse({status:403,description:'文件已存在'})
  @ApiResponse({status:404,description:'文件保存失败'})
  async uploadProcess(@Body() body:UploadProcessBody,@Request() req):Promise<any>{

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

    let {bucket_name,md5,contentSecret,contentName} = body

    let policy  = {
      //空间名
      'bucket':'',
      //文件保存路径，包括目录、文件名、扩展名
      'save-key':'',
      //请求过期事件
      'expiration':null,
      'date':'',
      'content-md5':md5,
      //异步回调通知路径，图片异步预处理回调也是这个接口
      'notify-url':'http://upyuns.frp2.chuantou.org/upyun/file/notify',
      //图片生存期限默认为180天
      'x-upyun-meta-ttl':180,
      //扩展参数，包含了空间名
      'ext-param':''
    }  

    if(!bucket_name|| !md5|| !contentName){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    if(md5.length!==32){
      data.code = 400
      data.message = 'md5参数不正确'
      return data
    }

    let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
    if(!bucket){
      data.code = 401
      data.message = '指定空间'+bucket_name+'不存在'
      return
    }
    //获取后台配置，创建上传参数，返回文件种类、以及文件所属目录
     await this.fileService.makePolicy(data,policy,bucket,body)
    //文件类型不存在、指定文件已存在
    if(data.code == 402 || data.code === 403 ){
      return data
    }

    //预保存图片
    await this.fileService.preSaveFile(data,policy,bucket,contentName,)

    //图片保存失败
    if(data.code == 405){
      return data
    }
    return data
  }


  /* 异步回调通知接口,原图不进行预处理，webp_damage、webp_undamage会删除原图，保存处理后图片
     接受两种请求
     application/x-www-form-urlencoded：即原图的上传回调，包含了原图的保存信息，保存为原图时根据它来更新数据库，
                                        但是其中没有空间名，所以需要从ext-param中获取空间名
     application/json：                 异步预处理上传回调                             
  */
  @Post('notify')
  async asyncNotify(@Body() body,@Request() req,@Headers() headers):Promise<any>{
    
    let content_type = headers['content-type']
    let md5 = headers['content-md5']
    let auth = headers['authorization']
    let date = headers['date']

    //接收到默认MIME类型，说明是上传回调
    if(content_type==='application/x-www-form-urlencoded'){
      console.log('notify接收到的application/x-www-form-urlencoded响应体为')
      console.log(body)
      let code = +body.code
      //解析出文件名即为文件md5
      let md5  = path.parse(body.url).name
      //文件扩展名，不包含.
      let type = path.parse(body.url).ext.substr(1)
      //从扩展参数中获取空间名
      let bucket_name= body['ext-param']
      //查找指定空间
      let bucket:Bucket  = await this.bucketRepository.findOne({name:bucket_name})
      //验签获取结果
      let pass =  await this.authUtil.notifyVerify(auth,bucket,'POST','/upyun/file/notify',date,md5,body)
      let status = 'pre'
      let kind = this.kindUtil.getKind(type)
      //处理图片类型
      if(kind==='image'){
        console.log('处理图片')
        //验签未通过
        if(!pass){
          console.log('验签未通过')
          //删除本地数据库中图片信息
          await this.fileService.postDeleteFile(bucket,md5,type,status,kind)
          return
        }
        //验签通过
        else{
          console.log('验签通过')
          //上传不成功
          if(code!==200){
            console.log('上传不成功')
            //删除本地数据库中图片信息
            await this.fileService.postDeleteFile(bucket,md5,type,status,kind)
            //打印出错信息
            console.log(code)
            console.log(body.message)
            return
          }
          //上传成功
          //如果保存格式为原图
          console.log('上传成功')
          if(bucket.format==='raw'){
            console.log('保存为原图')
            //直接根据上传回调信息更新数据库
            await this.fileService.postSaveFile(bucket,md5,type,body,kind)
          }
          //如果不是保存为原图不做处理
          else{
            console.log('保存为webp')
          //则这个上传回调信息无效
          }
          return
        }
      }else if(kind==='audio'){
        console.log('audio暂时未实现')
      }else if(kind==='video'){
        console.log('video暂时未实现')
      }else{
        throw new Error('kind不正确')
      }
      return
    }
    //如果请求MIME为json类型，说吗为异步预处理回调信息，只有图片保存格式不是原图时采用这种方式
    else if(content_type==='application/json'){
      console.log('notify接收到json响应')
      console.log(body)
      let code = body.status_code
      let bucket_name = body.service
      //解析出文件名即为文件md5
      let md5  = path.parse(body.imginfo.path).name
      //文件扩展名，不包含.
      let type = path.parse(body.imginfo.path).ext.substr(1)
      //目录数组，从顶层到底层
      let directorys = path.parse(body.imginfo.path).dir.spilt('/')
      //第一个元素为空字符串
      directorys.shift()
      //查找指定空间
      let bucket:Bucket  = await this.bucketRepository.findOne({name:bucket_name})
      //验签获取结果
      let pass =  await this.authUtil.taskNotifyVerify(auth,bucket,'POST','/upyun/file/notify',date,md5,body)
      let status = 'pre'
      let kind = this.kindUtil.getKind(type)
    
      //处理图片类型
      if(kind==='image'){
        console.log('处理图片类型')
        //验签未通过，这里也需要删除图片，因为两个回调信息顺序不确定
        if(!pass){
          console.log('验签未通过')
          await this.fileService.postDeleteFile(bucket,md5,type,status,kind)
          return
        }
        //验签通过
        else{
          console.log('验签通过')
          //上传不成功
          if(code!==200){
            console.log('上传不成功')
            //删除本地数据库中图片信息
            await this.fileService.postDeleteFile(bucket,md5,type,status,kind)
            //打印出错信息
            console.log(code)
            console.log(body.error)
            return
          }
          console.log('上传成功')
          //上传成功
          //如果保存格式为原图
          if(bucket.format==='raw'){
            console.log('不可能出现情况')
          }
          //如果不是保存为原图才对，根据预处理信息更新原图
          else{
            console.log('保存为'+bucket.format)
            let image:Image = (await bucket.images).find((image)=>{
              return image.md5 === md5
            })
            //直接根据上传回调信息更新数据库
            await this.fileService.postSaveFile(bucket,md5,type,body,kind)
            //删除云存储上原图
            await this.restfulUtil.deleteFile({code:200,message:''},bucket,image)
          }
          return
        }
      }else if(kind==='audio'){
        console.log('audio暂时未实现')
      }else if(kind==='video'){
        console.log('video暂时未实现')
      }else{
        throw new Error('kind不正确')
      }
    return 
    }
  }  


  /* 获取单个文件url方法 
     @Param bucket_name：空间名
     @Param md5：        文件的md5值
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.url：访问文件的全部url，包括域名、目录、文件名、扩展名、token、文件密钥、处理字符串
  */
  @Post('file')
  @ApiOperation({title:'获取单个文件url接口，包括CDN域名、save_key、token、文件密钥、处理字符串'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:410,description:'空间配置不存在'})
  @ApiResponse({status:412,description:'指定文件不存在'})
  @ApiResponse({status:417,description:'比例参数不正确'})
  @ApiResponse({status:418,description:'宽度比例参数不正确'})
  @ApiResponse({status:419,description:'高度比例参数不正确'})
  @ApiResponse({status:420,description:'宽高参数不正确'})
  @ApiResponse({status:421,description:'宽度参数不正确'})
  @ApiResponse({status:422,description:'高度参数不正确'})
  @ApiResponse({status:423,description:'像素参数不正确'})
  @ApiResponse({status:424,description:'缩放模式不正确'})
  @ApiResponse({status:425,description:'裁剪顺序不正确'})
  @ApiResponse({status:426,description:'裁剪重心不正确'})
  @ApiResponse({status:427,description:'裁剪宽高不正确'})
  @ApiResponse({status:428,description:'x参数不正确'})
  @ApiResponse({status:429,description:'y参数不正确'})
  @ApiResponse({status:430,description:'圆角参数不正确'})
  @ApiResponse({status:431,description:'水印参数不正确'})
  @ApiResponse({status:432,description:'水印图片url不存在'})
  @ApiResponse({status:433,description:'水印重心参数不正确'})
  @ApiResponse({status:434,description:'偏移参数不正确'})
  @ApiResponse({status:435,description:'透明度参数不正确'})
  @ApiResponse({status:436,description:'短边自适应参数不正确'})
  @ApiResponse({status:437,description:'旋转角度不正确'})
  @ApiResponse({status:438,description:'模糊半径不正确'})
  @ApiResponse({status:439,description:'模糊标准差不正确'})
  @ApiResponse({status:440,description:'锐化参数不正确'})
  @ApiResponse({status:441,description:'格式参数不正确'})
  @ApiResponse({status:442,description:'图片质量参数不正确'})
  @ApiResponse({status:443,description:'渐进参数不正确'})
  @ApiResponse({status:444,description:'去除元信息参数不正确'})
  async  getFile(@Body() body:FileBody):Promise<any>{
    let data = {
      code:200,
      message:"",
      url:''
    }
    //空间名、目录数组、文件md5
    let {bucket_name,md5,type} = body

    if(!bucket_name || !md5){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
    if(!bucket){
      data.code = 410
      data.message = '空间不存在'
      return
    }
    let kind = this.kindUtil.getKind(type)
    //处理图片类型
    if(kind==='image'){
      let image:Image = (await bucket.images).find((image)=>{
        return image.md5 === md5
      })
      await this.fileService.makeUrl(data,bucket,image,body,kind)
    }else if(kind==='audio'){
      console.log('audio暂时未实现')
    }else if(kind==='video'){
      console.log('video暂时未实现')
    }else{
      throw new Error('kind不正确')
    }
    return  data
  }


  /* 暂定获取指定目录下文件，分页获取 
     @Param bucket_name：文件所属空间
     @Return data.code： 状态码，200为成功，其他为错误
            data.message：响应信息
            data.baseUrl：访问文件的基本url
            data.files    分页后的文件信息数组，里面添加了访问文件url信息，url不包含域名，包含了文件密钥、token
            data.imges：   图片信息数组
            data.audios:  音频信息数组
            data.videos:  视频信息数组
            data.documents: 文档信息数组
  */
  @Post('files')
  @ApiOperation({title:'分页获取文件信息以及访问url列表'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:410,description:'指定空间不存在'})
  @ApiResponse({status:411,description:'指定目录不存在'})
  @ApiResponse({status:414,description:'指定目录下不存在文件'})
  async  files(@Body() body:FilesBody):Promise<any>{
     let data  = {
       code:200,
       message:'',
       baseUrl:'',
       total:null,
       //文件信息
       files:[],
       images:[],
       audios:[],
       videos:[],
       documents:[]

     }
     //当前页数、每页条目数
     let {bucket_name} = body
     if( !bucket_name){
       data.code = 400
       data.message = '缺少参数'
       return data
     }

     if(page&&!Number.isInteger(page) || pageSize&&!Number.isInteger(pageSize)){
      data.code = 400
      data.message = '参数不正确'
      return data
     }

     let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
     if(!bucket){
       data.code = 410
       data.message = '空间'+bucket_name+'不存在'
       return
     }

     data.baseUrl = bucket.base_url
     let directory:Directory = this.fileService.findDirectory(data,bucket,directorys)
     if(data.code === 411){
       return data
     }
     if(!directory.files||directory.files.length===0){
       data.code = 414
       data.message = '目录下不存在文件'
       return data
     }
     let path = ''
     directorys.forEach((value)=>{
       path+='/'+value
     })
     data.total = directory.files.length
     data.files = directory.files.slice((page-1)*pageSize,page*pageSize)
     if(bucket.public_or_private==='public'){
        data.files.forEach((value,index)=>{
          data.urls[index] = path+'/'+value.md5+'.'+value.type
          if(value.content_secret){
            data.urls[index]+='!'+value.content_secret
          }
        })
     }else{
      data.files.forEach(async (value,index)=>{
        data.urls[index] =path+'/'+value.md5+'.'+value.type+'?_upt='+await this.authUtil.getToken(bucket,path+'/'+value.md5+'.'+value.type)
        if(value.content_secret){
          data.urls[index]+='!'+value.content_secret
        }
      })
     }
     return data
  }


  /* 文件删除接口
     当客户端需要删除某个文件时使用，由于目前只有两个空间，每个空间目录唯一，则只需传递save-key的不包含目录部分、是否为公有空间即可确定文件
     @Param bucket_name：文件所属空间名
     @Param directorys： 文件所属目录数组，按照下标由小到大为从顶层目录到底层目录
     @Param md5：        文件的md5值
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.url：访问文件的全部url，包括域名、目录、文件名、扩展名、token、文件密钥、处理字符串
  */
  @ApiOperation({title:'删除指定图片接口'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:410,description:'指定空间不存在'})
  @ApiResponse({status:411,description:'指定目录不存在'})
  @ApiResponse({status:412,description:'指定文件不存在'})
  @ApiResponse({status:458,description:'查询出现错误'})
  @Post('deleteFile')
  async deleteFile(@Body() body:DeleteFileBody):Promise<any>{
      let data = {
          code : 200,
          message:''
      }
      let {bucket_name,directorys,md5} =body
      let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
      if(!bucket){
        data.code = 410
        data.message = '空间不存在'
        return
      }
      let status = 'post'
      let directory:Directory = this.fileService.findDirectory(data,bucket,directorys)
      let file:File = this.fileService.findFile(data,bucket,directorys,md5,status)
      if(data.code === 411 || data.code === 412){
        return data
      }
      await this.restfulUtil.deleteFile(data,bucket,directory,file)
      //删除文件失败
      if(data.code == 445){
          return data
      }
      return data
  }

  /* 文件上传接口，上传文件经过服务器，暂定不用
     @Param bucket_name：文件所属空间名
     @Param path： 文件所属目录路径，即/a/b/c形式
     @Param file:        文件字段
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
  */
  @ApiOperation({title:'经过服务器上传文件接口，暂定不使用'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:406,description:'上传请求解析错误'})
  @ApiResponse({status:410,description:'指定空间不存在'})
  @ApiResponse({status:411,description:'指定目录不存在'})
  @ApiResponse({status:415,description:'文件已存在'})
  @Post('uploadFile')
  async uploadFile(@Body() body:UploadFileBody,@Request() req):Promise<any>{
      let data = {
          code : 200,
          message:''
      }
      //解析得到的文件对象(包含了文件临时路径，文件名等信息)，其余字段对象
      let uploadFile
      let bucket_name,path
      await new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();  
        form.parse(req, function(err, fields, files) {  
          if(err){
            //这个错误无法模仿
            data.code = 406
            data.message = '请求解析错误'
            resolve()
            return
          }
          if(!fields||!files||!files.file||!fields.bucket_name||!fields.directorys){
            data.code = 400
            data.message = '缺少参数'
            resolve()
            return
          }
          uploadFile = files.file
          bucket_name = fields.bucket_name
          path = fields.path
          resolve()
          return
        });  
      })
      if(data.code == 400 || data.code == 406){
        return data
      }
      let directorys = path.spilt('/')
      directorys.shift()
      let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
      if(!bucket){
        data.code = 410
        data.message = '空间不存在'
        return
      }
      let status = 'post'
      let directory:Directory = this.fileService.findDirectory(data,bucket,directorys)
      if(data.code === 411 || data.code === 412){
        return data
      }
      await this.restfulUtil.deleteFile(data,bucket,directory,file)
      //删除文件失败
      if(data.code == 445){
          return data
      }
      return data
  }
}