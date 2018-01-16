import { Query, Resolver, ResolveProperty, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConfigService } from '../../service/ConfigService';
import { FileService } from '../../service/FileService';
import { RestfulUtil } from '../../util/RestfulUtil';
import { KindUtil } from '../../util/KindUtil'
import { AuthUtil } from '../../util/AuthUtil'
import { Document } from '../../model/Document'
import { Bucket } from '../../model/Bucket';
import { Audio } from '../../model/Audio'
import { Video } from '../../model/Video'
import { Image } from '../../model/Image';
import { File } from '../../model/File'
import { DownloadProcessBody } from '../../interface/file/DownloadProcessBody'
import { UploadProcessBody } from '../../interface/file/UploadProcessBody'
import { FileBody } from '../../interface/file/FileBody'
import { FilesBody } from '../../interface/file/FilesBody'
import { DeleteFileBody } from '../../interface/file/DeleteFileBody'
import { FileInfoBody } from '../../interface/file/FileInfoBody'
import { FileListBody } from '../../interface/file/FileListBody'
import * as  formidable from 'formidable'
import * as  path from 'path'

/*文件控制器，包含了文件下载预处理、上传预处理、异步回调通知、获取单个文件url、获取多个文件信息以及url、删除文件、从云存储获取单个文件信息、获取指定空间下文件列表等接口
  所有文件接口只接受json类型请求体，post请求方法
*/

@Resolver('File')
export class FileResolver {

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
  @Query('downloadProcess')
  async downloadProcess(req , body):Promise<any>{
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
      data.message = '获取下载预处理信息成功'
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
  @Mutation('uploadProcess')
  async uploadProcess(req , body):Promise<any>{
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

   /* 获取单个文件url方法 ，从后台获取
     @Param bucket_name：空间名
     @Param name：       文件名，不包括扩展名
     @Param type:        文件类型
     @Param imagePostProcessInfo 文件后处理信息，获取url做图的字符串
     @Return data.code：状态码，200为成功，其他为错误
             data.message：响应信息
             data.url：访问文件的全部url，包括域名、目录、文件名、扩展名、token、文件密钥、处理字符串
  */
  @Query('one')
  async  getFile(req , body):Promise<any>{
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
    }else{
      //暂不支持
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
  @Query('all')
  async  files(req , body):Promise<any>{
     let data  = {
       code:200,
       message:'',
       baseUrl:'',
       files:[],
       images:[],
       audios:[],
       videos:[],
       documents:[]
     }
     let {bucket_name} = body
     if(!bucket_name){
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
}    
