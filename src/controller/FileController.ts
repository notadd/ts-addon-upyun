import { ApiUseTags, ApiResponse, ApiOperation, ApiConsumes, ApiProduces, ApiImplicitBody } from '@nestjs/swagger';
import { Controller, Get, Post, Request, Response, Body, Param, Headers, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
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
import * as  formidable from 'formidable'
import * as  path from 'path'

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
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
  }

  /* 异步回调通知接口，接受两种请求，默认所有文件都会进行预处理，所有每个上传请求会接收到两个回调请求，一个是原图的，一个是预处理结果
     application/x-www-form-urlencoded：即原图的上传回调，包含了原图的保存信息，其中没有空间名，需要从ext-param中获取空间名，原图文件名并未在数据库中保存，直接删除即可
     application/json：                 异步预处理上传回调 ，根据文件名更新数据库                          
  */
  @Post('notify')
  @ApiOperation({ title: '上传、预处理回调接口，由云存储调用' })
  async asyncNotify( @Body() body, @Request() req, @Headers() headers, @Response() res): Promise<any> {
    let content_type = headers['content-type']
    let contentMd5 = headers['content-md5']
    let auth = headers['authorization']
    let date = headers['date']
    console.log(body)
    let data = {
      code: 200,
      message: ''
    }
    //接收到默认MIME类型，说明是上传回调
    if (content_type === 'application/x-www-form-urlencoded') {
      let code = +body.code
      //上传不成功时，要返回200,提示云存储不再发送回调请求
      if (code !== 200) {
        //打印出错信息
        res.sendStatus(200)
        res.end()
        return
      }
      //解析出原图文件名
      let name = path.parse(body.url).name
      //文件扩展名，不包含.
      let type = path.parse(body.url).ext.substr(1)
      let kind = this.kindUtil.getKind(type)
      //从扩展参数中获取空间名
      let bucketName = body['ext-param']
      //查找指定空间
      let bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName })
      if (!bucket) {
        res.sendStatus(200)
        res.end()
        return
      }
      //验签获取结果
      let pass = await this.authUtil.notifyVerify(auth, bucket, 'POST', '/upyun/file/notify', date, contentMd5, body)
      //验签不成功，要返回400,提示云存储继续发送回调请求
      if (!pass) {
        res.sendStatus(400)
        res.end()
        return
      }
      if (kind === 'image') {
        let image = new Image()
        image.name = name
        image.type = type
        await this.restfulUtil.deleteFile(data, bucket, image)
      } else {
        //暂不支持
      }
      if (data.code === 403) {
        res.sendStatus(400)
        res.end()
        return
      }
      res.sendStatus(200)
      res.end()
      return
    }
    //如果请求MIME为json类型，说吗为异步预处理回调信息，只有图片保存格式不是原图时采用这种方式
    else if (content_type === 'application/json') {
      let code = body.status_code
      //上传不成功时，要返回200,提示云存储不再发送回调请求
      if (code !== 200) {
        res.sendStatus(200)
        res.end()
        return
      }
      //响应体中空间名
      let bucketName = body.bucket_name
      //解析出文件名，根据它查找数据库保存文件
      let name = path.parse(body.imginfo.path).name
      //文件扩展名，不包含.，不是原图时为webp
      let type = path.parse(body.imginfo.path).ext.substr(1)
      let kind = this.kindUtil.getKind(type)
      //查找指定空间
      let bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName })
      //验签获取结果
      let pass = await this.authUtil.taskNotifyVerify(auth, bucket, 'POST', '/upyun/file/notify', date, contentMd5, body)
      //验签不成功，要返回400,提示云存储继续发送回调请求
      if (!pass) {
        res.sendStatus(400)
        res.end()
        return
      }
      await this.fileService.postSaveTask(data, bucket, name, body, kind)
      if (data.code === 401) {
        res.sendStatus(400)
        res.end()
        return
      }
      res.sendStatus(200)
      res.end()
      return
    }
  }
}