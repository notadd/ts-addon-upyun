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
import { FileInfoBody } from '../interface/file/FileInfoBody'
import { FileListBody } from '../interface/file/FileListBody'
import * as  formidable from  'formidable'
import * as  path       from  'path'

/*文件控制器，包含了文件下载预处理、上传预处理、异步回调通知、获取单个文件url、获取多个文件信息以及url、删除文件、从云存储获取单个文件信息、获取指定空间下文件列表等接口
  所有文件接口只接受json类型请求体，post请求方法
*/
@ApiUseTags('File')
@Controller('upyun/file')
export class FileController {

  constructor(
    private readonly authUtil: AuthUtil,
    private readonly kindUtil: KindUtil,
    private readonly restfulUtil: RestfulUtil,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    }

    /* 文件下载预处理接口
     当客户端需要下载某个文件时使用，文件不经过服务器，直接由客户端从云存储下载
     返回下载文件的方法、url、参数、头信息(包含了签名)
     @Param bucket_name：文件所属空间名
     @Param type：       上传文件扩展名，即文件类型
     @Param name：       文件名
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.baseUrl：下载时的基本url
             data.method： 下载方法
             data.headers：下载文件时的头信息，包含了日期、签名
  */
  @ApiOperation({title:'下载文件预处理接口，获取下载文件的方法、url、头信息'})
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
        //下载文件使用get方法
        method:'get',
        url:'http://v0.api.upyun.com',
        headers:{
          //头信息中签名
          authorization:'',
          //GMT格式字符串
          date:''
        }
      }
      let {bucket_name,name,type} =body
      if(!bucket_name|| !name){
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
        file = await this.imageRepository.findOne({name,type,bucketId:bucket.id})
      }else{
        //其他类型暂不支持
      }
      if(!file){
        data.code = 402
        data.message  = '指定文件'+name+'不存在'
        return data
      }
      data.url += '/'+bucket.name+'/'+bucket.directory+'/'+file.name+'.'+file.type
      data.headers.date = new Date(+new Date()+bucket.request_expire*1000).toUTCString()
      data.headers.authorization = await this.authUtil.getHeaderAuth(bucket,'GET',data.url.replace('http://v0.api.upyun.com',''),data.headers.date,'')
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
  @ApiResponse({status:402,description:'文件保存失败'})
  @ApiResponse({status:403,description:'比例参数不正确'})
  @ApiResponse({status:404,description:'宽度比例参数不正确'})
  @ApiResponse({status:405,description:'高度比例参数不正确'})
  @ApiResponse({status:406,description:'宽高参数不正确'})
  @ApiResponse({status:407,description:'宽度参数不正确'})
  @ApiResponse({status:408,description:'高度参数不正确'})
  @ApiResponse({status:409,description:'像素参数不正确'})
  @ApiResponse({status:410,description:'缩放模式不正确'})
  @ApiResponse({status:411,description:'裁剪顺序不正确'})
  @ApiResponse({status:412,description:'裁剪重心不正确'})
  @ApiResponse({status:413,description:'裁剪宽高不正确'})
  @ApiResponse({status:414,description:'x参数不正确'})
  @ApiResponse({status:415,description:'y参数不正确'})
  @ApiResponse({status:416,description:'圆角参数不正确'})
  @ApiResponse({status:417,description:'水印参数不正确'})
  @ApiResponse({status:418,description:'水印图片url不存在'})
  @ApiResponse({status:419,description:'水印重心参数不正确'})
  @ApiResponse({status:420,description:'偏移参数不正确'})
  @ApiResponse({status:421,description:'透明度参数不正确'})
  @ApiResponse({status:422,description:'短边自适应参数不正确'})
  @ApiResponse({status:423,description:'旋转角度不正确'})
  async uploadProcess(@Body() body:UploadProcessBody,@Request() req):Promise<any>{

    let data = {
      code:200,
      message:'',
      url:'http://v0.api.upyun.com',
      method:'post',
      form:{
        policy:'',
        authorization:''
      }
    }

    let {bucket_name,md5,contentName} = body

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

    let bucket:Bucket = await this.bucketRepository.createQueryBuilder("bucket")
                        .leftJoinAndSelect("bucket.image_config", "image_config")
                        .leftJoinAndSelect("bucket.audio_config", "audio_config")
                        .leftJoinAndSelect("bucket.video_config", "video_config")
                        .where("bucket.name = :name", { name: bucket_name })
                        .getOne()
    if(!bucket){
      data.code = 401
      data.message = '指定空间'+bucket_name+'不存在'
      return
    }

    //预保存图片,获取保存的图片，图片名为预处理图片名，会设置到policy的apps中去
    let image = await this.fileService.preSaveFile(data,bucket,body)
    //图片保存失败
    if(data.code == 402){
      return data
    }
    //获取后台配置，创建上传参数，返回文件种类、以及文件所属目录
    await this.fileService.makePolicy(data,policy,bucket,body,image)
    return data
  }


  /* 异步回调通知接口，接受两种请求，默认所有文件都会进行预处理，所有每个上传请求会接收到两个回调请求，一个是原图的，一个是预处理结果
     application/x-www-form-urlencoded：即原图的上传回调，包含了原图的保存信息，其中没有空间名，需要从ext-param中获取空间名，原图文件名并未在数据库中保存，直接删除即可
     application/json：                 异步预处理上传回调 ，根据文件名更新数据库                          
  */
  @Post('notify')
  @ApiOperation({title:'上传、预处理回调接口，由云存储调用'})
  async asyncNotify(@Body() body,@Request() req,@Headers() headers,@Response() res):Promise<any>{
    let content_type = headers['content-type']
    let contentMd5 = headers['content-md5']
    let auth = headers['authorization']
    let date = headers['date']
    console.log(body)
    let data = {
      code:200,
      message:''
    }
    //接收到默认MIME类型，说明是上传回调
    if(content_type==='application/x-www-form-urlencoded'){
      let code = +body.code
      //上传不成功时，要返回200,提示云存储不再发送回调请求
      if(code!==200){
        //打印出错信息
        res.sendStatus(200)
        res.end()
        return
      }
      //解析出原图文件名
      let name  = path.parse(body.url).name
      //文件扩展名，不包含.
      let type = path.parse(body.url).ext.substr(1)
      let kind = this.kindUtil.getKind(type)
      //从扩展参数中获取空间名
      let bucket_name= body['ext-param']
      //查找指定空间
      let bucket:Bucket  = await this.bucketRepository.findOne({name:bucket_name})
      if(!bucket){
        res.sendStatus(200)
        res.end()
        return
      }
      //验签获取结果
      let pass =  await this.authUtil.notifyVerify(auth,bucket,'POST','/upyun/file/notify',date,contentMd5,body)
      //验签不成功，要返回400,提示云存储继续发送回调请求
      if(!pass){
        res.sendStatus(400)
        res.end()
        return
      }
      if(kind==='image'){
        let  image = new Image()
        image.name = name
        image.type = type
        await this.restfulUtil.deleteFile(data,bucket,image)
      }else{
        //暂不支持
      }
      if(data.code === 403){
        res.sendStatus(400)
        res.end()
        return
      }
      res.sendStatus(200)
      res.end()
      return
    }
    //如果请求MIME为json类型，说吗为异步预处理回调信息，只有图片保存格式不是原图时采用这种方式
    else if(content_type==='application/json'){
      let code = body.status_code
      //上传不成功时，要返回200,提示云存储不再发送回调请求
      if(code!==200){
        res.sendStatus(200)
        res.end()
        return
      }
      //响应体中空间名
      let bucket_name = body.bucket_name
      //解析出文件名，根据它查找数据库保存文件
      let name  = path.parse(body.imginfo.path).name
      //文件扩展名，不包含.，不是原图时为webp
      let type = path.parse(body.imginfo.path).ext.substr(1)
      let kind = this.kindUtil.getKind(type)
      //查找指定空间
      let bucket:Bucket  = await this.bucketRepository.findOne({name:bucket_name})
      //验签获取结果
      let pass =  await this.authUtil.taskNotifyVerify(auth,bucket,'POST','/upyun/file/notify',date,contentMd5,body)
      //验签不成功，要返回400,提示云存储继续发送回调请求
      if(!pass){
        res.sendStatus(400)
        res.end()
        return
      }
      await this.fileService.postSaveTask(data,bucket,name,body,kind)
      if(data.code === 401){
        res.sendStatus(400)
        res.end()
        return
      }
      res.sendStatus(200)
      res.end()
      return
    }
  }  


  /* 获取单个文件url方法 ，从后台获取
     @Param bucket_name：空间名
     @Param md5：        文件的md5值
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.url：访问文件的全部url，包括域名、目录、文件名、扩展名、token、文件密钥、处理字符串
  */
  @Post('one')
  @ApiOperation({title:'获取单个文件url接口，包括CDN域名、save_key、token、文件密钥、处理字符串'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'空间配置不存在'})
  @ApiResponse({status:402,description:'指定文件不存在'})
  @ApiResponse({status:403,description:'比例参数不正确'})
  @ApiResponse({status:404,description:'宽度比例参数不正确'})
  @ApiResponse({status:405,description:'高度比例参数不正确'})
  @ApiResponse({status:406,description:'宽高参数不正确'})
  @ApiResponse({status:407,description:'宽度参数不正确'})
  @ApiResponse({status:408,description:'高度参数不正确'})
  @ApiResponse({status:409,description:'像素参数不正确'})
  @ApiResponse({status:410,description:'缩放模式不正确'})
  @ApiResponse({status:411,description:'裁剪顺序不正确'})
  @ApiResponse({status:412,description:'裁剪重心不正确'})
  @ApiResponse({status:413,description:'裁剪宽高不正确'})
  @ApiResponse({status:414,description:'x参数不正确'})
  @ApiResponse({status:415,description:'y参数不正确'})
  @ApiResponse({status:416,description:'圆角参数不正确'})
  @ApiResponse({status:417,description:'水印参数不正确'})
  @ApiResponse({status:418,description:'水印图片url不存在'})
  @ApiResponse({status:419,description:'水印重心参数不正确'})
  @ApiResponse({status:420,description:'偏移参数不正确'})
  @ApiResponse({status:421,description:'透明度参数不正确'})
  @ApiResponse({status:422,description:'短边自适应参数不正确'})
  @ApiResponse({status:423,description:'旋转角度不正确'})
  @ApiResponse({status:424,description:'模糊半径不正确'})
  @ApiResponse({status:425,description:'模糊标准差不正确'})
  @ApiResponse({status:426,description:'锐化参数不正确'})
  @ApiResponse({status:427,description:'格式参数不正确'})
  @ApiResponse({status:428,description:'图片质量参数不正确'})
  @ApiResponse({status:429,description:'渐进参数不正确'})
  @ApiResponse({status:430,description:'去除元信息参数不正确'})
  async  getFile(@Body() body:FileBody):Promise<any>{
    let data = {
      code:200,
      message:"",
      url:''
    }
    //空间名、目录数组、文件名
    let {bucket_name,name,type} = body

    if(!bucket_name || !name || !type){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
    if(!bucket){
      data.code = 401
      data.message = '空间不存在'
      return
    }
    let kind = this.kindUtil.getKind(type)
    //处理图片类型
    if(kind==='image'){
      let image:Image = await this.imageRepository.findOne({name,bucketId:bucket.id})
      if(!image){
        data.code = 402
        data.message = '指定图片不存在'
        return data
      }
      //所有文件调用统一的拼接Url方法
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


  /* 获取指定空间下文件，从后台数据库中获取
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
  @Post('all')
  @ApiOperation({title:'分页获取文件信息以及访问url列表'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'指定空间不存在'})
  async  files(@Body() body:FilesBody):Promise<any>{
     let data  = {
       code:200,
       message:'',
       baseUrl:'',
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

     let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
     if(!bucket){
       data.code = 401
       data.message = '空间'+bucket_name+'不存在'
       return
     }

     data.baseUrl = bucket.base_url
     await this.fileService.getAll(data,bucket)
     return data
  }


  /* 文件删除接口
     当客户端需要删除某个文件时使用，
     @Param bucket_name：文件所属空间名
     @Param type：       文件扩展名，即文件类型
     @Param name：       文件名
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
  */
  @ApiOperation({title:'删除指定文件接口'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'指定空间不存在'})
  @ApiResponse({status:402,description:'指定文件不存在'})
  @ApiResponse({status:403,description:'删除云文件失败'})
  @Post('deleteFile')
  async deleteFile(@Body() body:DeleteFileBody):Promise<any>{
      let data = {
          code : 200,
          message:''
      }
      let {bucket_name,type,name} =body
      if(!bucket_name || !name || !type){
        data.code = 400
        data.message = '缺少参数'
        return data
      }

      let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
      if(!bucket){
        data.code = 401
        data.message = '空间'+bucket_name+'不存在'
        return
      }
      let kind = this.kindUtil.getKind(type)
      if(kind==='image'){
        let image:Image = await this.imageRepository.findOne({name,bucketId:bucket.id})
        if(!image){
          data.code = 402
          data.message = '文件md5='+name+'不存在'
          return
        }
        await this.restfulUtil.deleteFile(data,bucket,image)
        if(data.code === 403){
          return data
        }
        await this.imageRepository.delete({name,bucketId:bucket.id})
      }
      
      return data
  }

  /* 获取文件信息接口,从有拍云获取
     @Param bucket_name：文件所属空间名
     @Param type：       文件扩展名，即文件类型
     @Param name：       文件的名
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.info.size:文件大小
             data.info.date：文件创建时间
             data.info.md5:文件实际md5,目前文件名为原图md5,预处理md5结果未保存
  */
  @ApiOperation({title:'获取指定文件信息接口'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'指定空间不存在'})
  @ApiResponse({status:402,description:'指定文件不存在'})
  @ApiResponse({status:403,description:'获取文件信息失败'})
  @Post('info')
  async info(@Body() body:FileInfoBody):Promise<any>{
      let data = {
          code : 200,
          message:'',
          info:{
            size:null,
            md5:'',
            date:''
          }
      }
      let {bucket_name,type,name} =body
      let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
      if(!bucket){
        data.code = 401
        data.message = '空间'+bucket_name+'不存在'
        return
      }
      let kind = this.kindUtil.getKind(type)
      if(kind==='image'){
        let image:Image = await this.imageRepository.findOne({name,bucketId:bucket.id})
        if(!image){
          data.code = 402
          data.message = '文件'+name+'不存在'
          return
        }
        let info = await this.restfulUtil.getFileInfo(data,bucket,image)
        if(data.code === 403){
          return data
        }
        data.info.size = info.file_size
        data.info.md5 = info.file_md5
        data.info.date = info.file_date
      }
      return data
  }

  /* 获取文目录文件列表,只能获取指定下的目录、文件的名称、大小、最后修改日期
     @Param bucket_name：文件所属空间名，由于每个空间使用一个目录，所以这里不需要目录名
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
  */
  @ApiOperation({title:'从又拍云获取指定空间下文件列表，只能获取指定下的目录、文件的名称、大小、最后修改日期'})
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'指定空间不存在'})
  @ApiResponse({status:402,description:'获取文件列表失败'})
  @Post('list')
  async list(@Body() body:FileListBody):Promise<any>{
      let data = {
          code : 200,
          message:'',
          info:[]
      }
      let {bucket_name} =body
      let bucket:Bucket = await this.bucketRepository.findOne({name:bucket_name})
      if(!bucket){
        data.code = 401
        data.message = '空间'+bucket_name+'不存在'
        return data
      }
      let info = await this.restfulUtil.getFileList(data,bucket)
      if(data.code === 402){
        return data
      }
      return data
    }
}