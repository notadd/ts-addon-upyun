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


}    
