import { Component, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestfulUtil } from '../util/RestfulUtil'
import { ConfigService } from './ConfigService'
import { AuthUtil} from '../util/AuthUtil'
import { ProcessStringUtil } from '../util/ProcessStringUtil'
import { Directory } from '../model/Directory'
import { Bucket } from '../model/Bucket'
import { Image } from '../model/Image'
import { File } from '../model/File'
import { UploadBody } from '../interface/image/UploadBody'
import { isArray } from 'util';
const request = require('request')
const crypto = require('crypto')
const allowExtension = require('../allowExtension.json')

/* 图片服务组件，包含了上传时创建policy对象、预保存图片
   回调通知时，后保存、后删除
   查找图片、创建访问图片的url等功能
*/
@Component()
export class FileService {

  private readonly imageExtension:Set<string>
  private readonly audioExtension:Set<string>
  private readonly videoExtension:Set<string>

  constructor(
    private readonly authUtil:AuthUtil,
    private readonly restfulUtil:RestfulUtil,
    private readonly processStringUtil:ProcessStringUtil,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Directory) private readonly directoryRepository: Repository<Directory>){
      this.imageExtension = allowExtension.image
      this.audioExtension = allowExtension.audio
      this.videoExtension = allowExtension.video
    }

/* 创建上传参数
   @Param data：返回信息，用来设置状态码
   @Param policy：policy对象
   @Param config：空间配置
   @Param contentMd5：上传文件的md5值
   @Param contentSecret：文件访问密钥，可选
   @Param contentName：文件名
   @Return null
 */
  async makePolicy(data:any,policy:any,bucket:Bucket,body:UploadBody):Promise<any>{
    let kind:string //image  or  audio  or video
    let {directorys,md5,contentSecret,contentName} = body
    //设置各种上传参数
    if(contentSecret){
      policy['content-secret'] = contentSecret
    }
    policy['bucket'] = bucket.name
    policy['ext-param']+=bucket.name+'&'
    data['baseUrl'] = data['baseUrl']+='/'+bucket.name

    //文件类型以文件名确定，默认为.jpg
    let type:string = contentName.substr(contentName.lastIndexOf('.')+1).toLowerCase()
    if(!type){
      data.code = 412
      data.message = '文件类型不存在'
      return
    }
    if(this.imageExtension.has(type)){
      kind = 'image'
    }else if(this.audioExtension.has(type)){
      kind = 'audio'
    }else if(this.videoExtension.has(type)){
      kind = 'video'
    }else{
      data.code = 413
      data.message = '不支持文件扩展名'
      return 
    }
    policy['ext-param']+=kind
    let parent:Directory = bucket.root
    for(let i=0;i<directorys.length;i++){
       let directory = parent.children.find((value)=>{
         return value.name === directorys[i]
       })
       if(!directory){
         data.code = 414
         data.message = '指定目录'+directory[i]+'不存在'
         break
       }
       parent = directory
    }
    if(data.code === 414){
      return
    }

    if(kind==='image'){
       let image:Image = parent.images.find((image)=>{
         return image.md5 === md5
       })
       if(image){
         data.code = 415
         data.message = '指定图片'+image.name+',md5='+image.md5+'，已存在'
         return
       }
    }else if(kind==='audio'){
       //暂时不管
       console.log('audio暂时未实现')
    }else if(kind==='video'){
       console.log('video暂时未实现')
    }else{
      throw new Error('kind不正确')
    }

    //保存路径为目录加上保存文件名，保存文件名为其md5值，扩展名不变
    directorys.forEach((name)=>{
      policy['save-key']+='/'+name
    })
    policy['save-key'] +='/'+md5+'.'+type
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
      let format = bucket.format?bucket.format:'raw'
      //原图不处理
      if(format == 'raw'){
        //原图不出里
      }else if(format == 'webp_damage'){
        //保存为有损webp
        obj['x-gmkerl-thumb'] = '/format/webp'
        obj['save_as'] = policy['save-key'].replace(type,'webp')
        //apps字段应为json字符串
        policy['apps'] = [obj]
      }else if(format == 'webp_undamage'){
        //保存为无损webp
        obj['x-gmkerl-thumb'] = '/format/webp/lossless/true'
        obj['save_as'] = policy['save-key'].replace(type,'webp')
        policy['apps'] = [obj]
      }else{
        throw new Error('格式配置不正确，应该不能发生')
      }
    }else if(kind==='audio'){
      //暂时不管
      console.log('audio暂时未实现')
   }else if(kind==='video'){
      console.log('video暂时未实现')
   }else{
     throw new Error('kind不正确')
   }
    
    //设置表单policy字段
    data.form.policy = Buffer.from(JSON.stringify(policy)).toString('base64')
    //生成签名，上传签名需要policy参数
    let method = data.method
    data.form.authorization = await this.authUtil.getBodyAuth(bucket,method,policy)
    data.code = 200
    data.message = 'policy创建成功'
    return  {kind,parent}
  }

  /* 预保存图片，作为一个锚点，在回调通知中进行验证
   */
  async preSaveFile(data:any,policy:any,bucket:Bucket,parent:Directory,kind:string,contentName:string):Promise<void>{

    let type = contentName.substr(contentName.lastIndexOf('.')+1).toLowerCase()
    if(kind==='image'){
      try{
        let image = new Image()
        image.name = contentName
        image.bucket_name = bucket.name
        image.md5 =policy['content-md5']
        image.type = type
        image.status = 'pre'
        image.content_secret = policy['content-secret']?policy['content-secret']:null
        image.directory = parent
        parent.images.push(image)
        await this.directoryRepository.save(parent)
        data.code = 200
        data.message = '图片保存成功'
      }catch(err){
        data.code = 416
        data.message = '图片保存失败'
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


  async postDeleteFile(bucket_name:string,md5:string,type:string,status:string,kind:string){
    if(kind==='image'){
      await this.imageRepository.delete({bucket_name,md5,type,status})
    }else if(kind==='audio'){
       console.log('audio暂时未实现')
    }else if(kind==='video'){
       console.log('video暂时未实现')
    }else{
       throw new Error('kind不正确')
    }
  }

  /* 回调通知验签成功，且响应码为200时，后保存图片 */
  async postSaveFile(bucket_name:string,directorys:string[],md5:string,type:string,body:any,kind:string){
    let save_key = body.url.substr(0,body.url.lastIndexOf('.'))
    let image_width = body['image-width']
    let image_height = body['image-height']
    let image_type = body['image-type'].toLowerCase()
    let image_frames = body['image-frames']
    let format = bucket.format
    await this.imageRepository.update({
        save_key,
        bucket:config.bucket,
        status:'pre'
    },{
      width:image_width,
      height:image_height,
      type:image_type,
      frames:image_frames,
      status:'post'})
    return
  }

  /* 异步预处理回调时后保存图片 */
  async postSaveTaskResult(bucket:Bucket,body:any,save_key:string):Promise<string>{
    let image:Image = await this.imageRepository.findOne({save_key,bucket:config.bucket,status:'pre'})
    let rawPath = save_key+'.'+image.type
    await this.imageRepository.update({save_key,bucket:config.bucket,status:'pre'},{
      width:body.imginfo.width,
      height:body.imginfo.height,
      type:body.imginfo.type.toLowerCase(),
      frames:body.imginfo.frames,
      status:'post'})
    return rawPath
  }  

  //创建图片完成url
  async makeUrl(data:any,config:Config,image:Image,body:any):Promise<void>{
    //如果图片不包含bucket属性，虽然不可能出现
    if(!image.bucket){
      data.code = 428
      data.message = '图片不在空间中'
      return
    }
    //拼接基本url
    data.url += config.base_url
    //save_key
    data.url += image.save_key+'.'+image.type
    //如果是私有空间需要拼接token查询字符串
    if(config.public_or_private=='private'){
      data.url += '?_upt='
      data.url += this.authUtil.getToken(config,data.url)
    }
    
    data.url+='!'
    if(image.content_secret){
      data.url +=image.content_secret 
    }
    console.log('1:'+data.url)
    //拼接处理字符串，使用请求体参数
    data.url += this.processStringUtil.makeProcessString(data,body,config)
    console.log('2:'+data.url)
    return 
  }

  

}
