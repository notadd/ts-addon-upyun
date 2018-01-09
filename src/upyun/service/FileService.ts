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
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>){
    }

/* 创建上传参数
   @Param data：返回信息，用来设置状态码
   @Param policy：policy对象
   @Param bucket：空间配置
   @Param body: 请求体
   @Return null
 */
  async makePolicy(data:any,policy:any,bucket:Bucket,body:UploadProcessBody):Promise<void>{
    let {md5,contentSecret,contentName} = body
    //设置各种上传参数
    if(contentSecret){
      policy['content-secret'] = contentSecret
    }
    policy['bucket'] = bucket.name
    policy['ext-param']+=bucket.name
    data['baseUrl'] +='/'+bucket.name

    //文件类型以文件名确定，默认为.jpg
    let type:string = contentName.substr(contentName.lastIndexOf('.')+1).toLowerCase()
    if(!type){
      data.code = 402
      data.message = '文件类型不存在'
      return
    }
    let kind = this.kindUtil.getKind(type)
    
    if(kind==='image'){
      let image:Image = (await bucket.images).find((image)=>{
        return image.md5 === md5
      })
      if(image){
        data.code = 403
        data.message = '指定文件已经存在'
        return
      }
    }else{
      console.log('还不支持')
    }
    
    policy['save-key'] +='/'+bucket.directory+'/'+md5+'.'+type
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
     console.log('还不知池')
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

  /* 预保存文件，作为一个锚点，在回调通知中进行验证
     @Param data：返回信息，用来设置状态码
     @Param policy：policy对象
     @Param bucket：空间配置
     @Param parent：文件所属目录对象
     @Param contentName：文件名
     @Return null
   */
  async preSaveFile(data:any,policy:any,bucket:Bucket,contentName:string):Promise<void>{
    let type = contentName.substr(contentName.lastIndexOf('.')+1).toLowerCase()
    let kind = this.kindUtil.getKind(type)
    if(kind==='image'){
      try{
        //创建图片
        let image = new Image()
        image.name = contentName
        image.md5 =policy['content-md5']
        image.type = type
        image.status = 'pre'
        image.content_secret = policy['content-secret']?policy['content-secret']:null
        image.bucket = bucket
        await this.imageRepository.save(image)
        data.code = 200
        data.message = '图片保存成功'
      }catch(err){
        data.code = 405
        data.message = '图片保存失败'+err.toString()
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


  async postDeleteFile(bucket:Bucket,md5:string,type:string,status:string,kind:string){
    console.log('对文件进行后删除')
    if(kind==='image'){
      let image:Image = (await bucket.images).find((image)=>{
        return image.md5 === md5
      })
      if(!image){
        return
      }
      this.imageRepository.delete(image)
    }else if(kind==='audio'){
       console.log('audio暂时未实现')
    }else if(kind==='video'){
       console.log('video暂时未实现')
    }else{
       throw new Error('kind不正确')
    }
  }

  /* 回调通知验签成功，且响应码为200时，后保存图片 */
  async postSaveFile(bucket:Bucket,md5:string,type:string,body:any,kind:string){
    console.log('对文件进行后保存')
    if(kind==='image'){
      let image_width = body['image-width']
      let image_height = body['image-height']
      let image_type = body['image-type'].toLowerCase()
      let image_frames = body['image-frames']
      let format = bucket.format
      let image:Image = (await bucket.images).find((image)=>{
        return image.md5 === md5
      })
      if(!image){
        return
      }
      await this.imageRepository.update(image,{
        width:image_width,
        height:image_height,
        type:image_type,
        frames:image_frames,
        status:'post'
      })
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
  async makeUrl(data:any,bucket:Bucket,file:File|Image|Video|Audio|Document,body:any,kind:string):Promise<void>{
    data.url += '/'+bucket.directory+'/'+file.md5+'.'+file.type
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
      data.url += this.processStringUtil.makeProcessString(data,body,bucket)
      console.log('2:'+data.url)
    }
    return 
  }
}
