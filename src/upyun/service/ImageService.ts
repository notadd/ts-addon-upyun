import { Component, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestfulService } from './RestfulService'
import { ConfigService } from './ConfigService'
import { AuthUtil} from '../util/AuthUtil'
import { ProcessStringUtil } from '../util/ProcessStringUtil'
import { Config } from '../model/Config'
import { Image } from '../model/Image'
import { isArray } from 'util';
const request = require('request')
const crypto = require('crypto')


/* 图片服务组件，包含了上传时创建policy对象、预保存图片
   回调通知时，后保存、后删除
   查找图片、创建访问图片的url等功能
*/
@Component()
export class ImageService {

  constructor(
    private readonly authUtil:AuthUtil,
    @Inject(forwardRef(() => RestfulService)) private readonly restfulService: RestfulService,
    private readonly processStringUtil:ProcessStringUtil,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>){}

/* 创建上传参数
   @Param data：返回信息，用来设置状态码
   @Param policy：policy对象
   @Param config：空间配置
   @Param contentMd5：上传文件的md5值
   @Param contentSecret：文件访问密钥，可选
   @Param contentName：文件名
   @Return null
 */
  async makePolicy(data:any,policy:any,config:Config,contentMd5:string,contentSecret:string,contentName:string):Promise<void>{
    
  
    //设置各种上传参数
    if(contentSecret){
      policy['content-secret'] = contentSecret
    }
    policy['bucket'] = config.bucket
    data['baseUrl'] = data['baseUrl']+='/'+config.bucket
    //文件类型以文件名确定，默认为.jpg
    let type:string
    if(contentName){
      type = contentName.substr(contentName.lastIndexOf('.'))
    }else{
      type = '.jpg'
    }
    type = type?type:'.jpg'
    //保存路径为目录加上保存文件名，保存文件名为其md5值，扩展名不变
    policy['save-key'] = '/'+config.directory+'/'+contentMd5+type
    policy['expiration'] = Math.floor((+new Date())/1000)+config.request_expire
    policy['date'] = new Date(+new Date()+config.request_expire*1000).toUTCString()
    //根据配置，设置预处理参数，只有一个预处理任务
    let obj = {
      'name': 'thumb',                      
      'x-gmkerl-thumb': '',   
      'save_as': '',   
      'notify_url': policy['notify-url']
    }
    let format = config.format?config.format:'raw'
    if(format == 'raw'){
      //原图保存，不需要设置apps参数
    }else if(format == 'webp_damage'){
      //保存为有损webp
      obj['x-gmkerl-thumb'] = '/format/webp'
      obj['save_as'] = data.save_as.replace(type,'_webp_damage'+type)
      //apps字段应为json字符串
      policy['apps'] = JSON.stringify(new Array().push(obj))
    }else if(format == 'webp_undamage'){
      //保存为无损webp
      obj['x-gmkerl-thumb'] = '/format/webp/lossless/true'
      obj['save_as'] = data.save_as.replace(type,'_webp_undamage'+type)
      policy['apps'] = JSON.stringify(new Array().push(obj))
    }else{
      data.code = 423
      data.message = '格式配置不正确'
      return 
    }
    //设置表单policy字段
    data.form.policy = Buffer.from(JSON.stringify(policy)).toString('base64')
    //生成签名，上传签名需要policy参数
    let method = data.method
    data.form.authorization = await this.authUtil.getBodyAuth(config,method,policy)
    data.code = 200
    data.message = 'policy创建成功'
    return 
  }

  /* 预保存图片，作为一个锚点，在回调通知中进行验证
   */
  async preSaveImage(data:any,policy:any,config:Config,contentName:string):Promise<void>{


    let bucket = config.bucket
    let directory = config.directory
    let baseUrl = config.base_url

    //查找图片是否已经存在且保存状态为post,要使用save_key、bucket、status一起查找
    //如果找到post状态图片说明已经被回调保存，返回图片已存在
    //也可能有相应save_key、bucket的图片，但是状态为pre，则此时说明图片还未回调保存，则需要返回新的auth
    let isExist = await this.imageRepository.findOne({save_key:policy['save-key'],bucket})
    if(isExist&&isExist.status === 'post'){
      data.code = 424
      data.message = '图片已存在'
      return 
    }
    //如果存在状态为pre，说明不需要预保存，还未回调保存
    else if(isExist&&isExist.status==='pre'){
      data.code = 200
      data.message = '图片存在，还未回调保存'
      return
    }else{
      
    }

    //保存图片
    try{
      let image = new Image()
      image.name = contentName?contentName:null
      //这里save-key是原图的，在回调通知里可以根据保存格式更新为webp的key
      image.save_key = policy['save-key']
      image.bucket = policy['bucket']
      image.status = 'pre'
      image.content_secret = policy['content-secret']?policy['content-secret']:null
      await this.imageRepository.save(image)
      data.code = 200
      data.message = '图片保存成功'
    }catch(err){
      data.code = 425
      data.message = '图片保存失败'
    }  
    return 
  }


  /* 回调通知验签成功，且响应码为200时，后保存图片 */
  async postSaveImage(config:Config,body:any){
    let save_key = body.url
    let image_width = body['image-width']
    let image_height = body['image-height']
    let image_type = body['image-type']
    let image_frames = body['image-frames']
    let task_ids = body['task_ids']
    let format = config.format
    if(format == 'raw'){
      //保存原图时，更新图片信息与状态
      await this.imageRepository.update({
        save_key:body['url']
      },{
        width:image_width,
        height:image_height,
        type:image_type,
        frames:image_frames,
        status:'post'})
    }else if(format == 'webp_damage' || format == 'webp_undamage'){
      //处理结果不存在
      if(!task_ids) {
        return
      }
      let tasks:Array<any>
      if((typeof task_ids)==='string'){
        tasks = JSON.parse(task_ids)
      }else{
        tasks = task_ids
      }
      
      if(!isArray(tasks) || tasks.length!=1 || tasks[0].status_code!=200){
        return
      }
      let bucket:string = tasks[0].service
      let imginfo:any = tasks[0].imginfo
      if(!imginfo){
        return
      }
      //更新原图信息为预处理后信息
      await this.imageRepository.update({save_key,bucket},{
        save_key:imginfo.path,
        width:imginfo.width,
        height:imginfo.height,
        type:imginfo.type,
        frames:imginfo.frames,
        status:'post'})
      await this.restfulService.deleteFile({code:200,message:''},config,save_key)
    }else{
      //format为其他格式
    }
    //回调通知暂不返回信息
    return
  }

  //上传文件失败，删除本地图片
  async postDeleteImage(save_key:string){
    await this.imageRepository.delete({save_key,status:'pre'})
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
    data.url += image.save_key
    //如果是私有空间需要拼接token查询字符串
    if(config.public_or_private=='private'){
      data.url += '?_upt='
      data.url += this.authUtil.getToken(config,'/'+image.bucket+image.save_key)
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
