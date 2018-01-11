import { Component, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from './ConfigService'
import { ProcessStringUtil } from '../util/ProcessStringUtil'
import { RestfulUtil } from '../util/RestfulUtil';
import { KindUtil } from '../util/KindUtil'
import { AuthUtil } from '../util/AuthUtil'
import { Document } from '../model/Document'
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio'
import { Video } from '../model/Video'
import { Image } from '../model/Image';
import { File } from '../model/File'
import { FileBody } from '../interface/file/FileBody'
import { UploadProcessBody } from '../interface/file/UploadProcessBody'
import { isArray } from 'util';
const request = require('request')
const crypto = require('crypto')

/* 图片服务组件，包含了上传时创建policy对象、预保存图片
   回调通知时，后保存、后删除
   查找图片、创建访问图片的url等功能
*/
@Component()
export class FileService {


  constructor(
    private readonly authUtil:AuthUtil,
    private readonly kindUtil:KindUtil,
    private readonly restfulUtil:RestfulUtil,
    private readonly processStringUtil:ProcessStringUtil,
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Audio) private readonly audioRepository: Repository<Audio>,
    @InjectRepository(Video) private readonly videoRepository: Repository<Video>,   
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>){}

    
/* 创建上传参数
   @Param data：返回信息，用来设置状态码
   @Param policy：policy对象
   @Param bucket：空间配置
   @Param body: 请求体
   @Return null
 */
  async makePolicy(data:any,policy:any,bucket:Bucket,body:UploadProcessBody,file:File|Image|Video|Audio|Document):Promise<void>{
    let {md5,contentSecret,contentName} = body
    //设置各种上传参数
    if(contentSecret){
      policy['content-secret'] = contentSecret
    }
    policy['bucket'] = bucket.name
    policy['ext-param']+=bucket.name
    data['baseUrl'] +='/'+bucket.name
    //文件类型以文件扩展名确定，如果不存在扩展名为file
    let type:string = file.type || ''
    let kind = this.kindUtil.getKind(type)
    //这里原图的save_key不保存它，在回调中直接删除
    policy['save-key'] +='/'+bucket.directory+'/'+md5+'_'+(+new Date())+'.'+type
    policy['expiration'] = Math.floor((+new Date())/1000)+bucket.request_expire
    policy['date'] = new Date(+new Date()+bucket.request_expire*1000).toUTCString()
    //根据配置，设置预处理参数，只有一个预处理任务
    if(kind === 'image'){
      let obj = {
        'name': 'thumb',                      
        'x-gmkerl-thumb': '',   
        'save_as': '',
        'notify_url': policy['notify-url']
      }
      let format = bucket.format || 'raw'
      //原图不处理
      if(format == 'raw'){
        //保存为原图，为了防止没有预处理字符串时不进行预处理任务，加上了/scale/100
        obj['x-gmkerl-thumb'] = this.processStringUtil.makeImageProcessString(data,bucket,body.imagePreProcessInfo)+'/scale/100'
        //这里将预处理的文件名设置为刚才保存的文件名，在回调中根据文件名来更新它，保存为原图时，
        obj['save_as'] = '/'+bucket.directory+'/'+file.name+'.'+file.type
        //apps字段应为json字符串
        policy['apps'] = [obj]
      }else if(format == 'webp_damage'){
        //保存为有损webp
        obj['x-gmkerl-thumb'] = this.processStringUtil.makeImageProcessString(data,bucket,body.imagePreProcessInfo)+'/format/webp/strip/true'
        obj['save_as'] = '/'+bucket.directory+'/'+file.name+'.'+'webp'
        //apps字段应为json字符串
        policy['apps'] = [obj]
      }else if(format == 'webp_undamage'){
        //保存为无损webp
        obj['x-gmkerl-thumb'] = this.processStringUtil.makeImageProcessString(data,bucket,body.imagePreProcessInfo)+'/format/webp/lossless/true/strip/true'
        obj['save_as'] = '/'+bucket.directory+'/'+file.name+'.'+'webp'
        policy['apps'] = [obj]
      }else{
        throw new Error('格式配置不正确，应该不能发生')
      }
    }else{
     //暂时不支持
   }
    //设置表单policy字段
    data.form.policy = Buffer.from(JSON.stringify(policy)).toString('base64')
    //生成签名，上传签名需要policy参数
    let method = data.method
    data.form.authorization = await this.authUtil.getBodyAuth(bucket,method,policy)
    data.code = 200
    data.message = 'policy创建成功'
    return 
  }

  /* 预保存文件，只保存预处理结果，在回调中对其进行更新，原图在回调中直接删除
     @Param data：返回信息，用来设置状态码
     @Param bucket：空间配置
     @Param contentName：文件名
     @Return null
   */
  async preSaveFile(data:any,bucket:Bucket,body:UploadProcessBody):Promise<File|Image|Video|Audio|Document>{
    let { md5 , contentName , contentSecret , tags} = body
    let type = contentName.substr(contentName.lastIndexOf('.')+1).toLowerCase()
    let kind = this.kindUtil.getKind(type)
    if(kind==='image'){
      //创建图片
      let image = new Image()
      image.raw_name = contentName
      //这个文件名会设置到预处理参数apps的save_as中去，而不是上传参数的save_key中，那个文件名不保存，在回调中直接删除
      image.name = md5+'_'+(+new Date())
      image.md5 = md5
      image.tags = tags
      image.type = type
      image.status = 'pre'
      image.content_secret = contentSecret || null
      image.bucket = bucket
      try{
        await this.imageRepository.save(image)
        data.code = 200
        data.message = '图片保存成功'
      }catch(err){
        data.code = 402
        data.message = '图片保存失败'+err.toString()
      }  
      return image
    }else{
       //还不支持
    }
  }


  /* 预处理回调通知验签成功，且响应码为200时，后保存图片 */
  async postSaveTask(data:any,bucket:Bucket,name:string,body:any,kind:string):Promise<void>{
    if(kind==='image'){
      let image:Image = await this.imageRepository.findOne({name,bucketId:bucket.id,status:'pre'})
      image.width = body.imginfo['width'],
      image.height = body.imginfo['height'],
      image.type = body.imginfo['type'].toLowerCase(),
      image.frames = body.imginfo['frames'],
      image.status = 'post'
      //从云存储获取预处理文件的md5与处理后大小
      let {file_size,file_md5} = await this.restfulUtil.getFileInfo(data,bucket,image)
      image.size = file_size
      image.md5 = file_md5
      try{
        await this.imageRepository.save(image)
      }catch(err){
        data.code = 401
        data.message = '更新预处理图片失败'
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

  
  //创建图片完成url
  async makeUrl(data:any,bucket:Bucket,file:File|Image|Video|Audio|Document,body:FileBody,kind:string):Promise<void>{
    data.url += '/'+bucket.directory+'/'+file.name+'.'+file.type
    //如果是私有空间需要拼接token查询字符串
    if(bucket.public_or_private=='private'){
      data.url += '?_upt='
      data.url += this.authUtil.getToken(bucket,data.url)
    }
    data.url = bucket.base_url.concat(data.url)
    data.url+='!'
    if(file.content_secret){
      data.url +=file.content_secret 
    }
    console.log('1:'+data.url)
    if(kind==='image'){
      //拼接处理字符串，使用请求体参数
      data.url += this.processStringUtil.makeImageProcessString(data,bucket,body.imagePostProcessInfo)
      console.log('2:'+data.url)
    }
    return 
  }

  async getAll(data:any,bucket:Bucket){
    data.files = await bucket.files
    data.images = await bucket.images
    data.audios  = await bucket.audios
    data.videos = await bucket.videos
    data.documents = await bucket.documents

    let addUrl = function (value){
      value.url = '/'+bucket.name+'/'+value.name+'.'+value.type
      if(bucket.public_or_private==='private'){
        value.url+='?_upt='+this.authUtil.getToken(bucket,value.url)
      }
      if(value.content_secret){
        value.url+='!'+value.content_secret
      }
    }
    data.files.forEach(addUrl)
    data.images.forEach(addUrl)
    data.audios.forEach(addUrl)
    data.videos.forEach(addUrl)
    data.documents.forEach(addUrl)
    return 
  }
}
