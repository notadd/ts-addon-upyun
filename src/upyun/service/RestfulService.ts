import { Component, Inject,forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageService } from './ImageService'
import { ConfigService } from './ConfigService'
import { AuthUtil } from '../util/AuthUtil'
import { Config } from '../model/Config'
import { Image} from '../model/Image'
const fs  = require('fs')
const crypto = require('crypto')
const request = require('request')
const mime = require('mime')

/* 包含了restfulAPI的各种功能 
   删除文件、创建目录、删除目录、获取文件信息、获取目录文件列表、获取服务使用量
*/
@Component()
export class RestfulService {

  private readonly apihost = 'http://v0.api.upyun.com'

  constructor(
    private readonly authUtil:AuthUtil,
    @Inject(forwardRef(() => ImageService)) private readonly imageService:ImageService,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Config) private readonly configRepository: Repository<Config>){}



  async uploadFile(data:any,config:Config,file:any):Promise<string>{
    
    let {name,path,size} = file
    let contentMd5 = crypto.createHash('md5').update(fs.readFileSync(path)).digest('hex')
    let extension:string = name.substr(name.lastIndexOf('.'))
    extension = extension?extension:'.jpg'
    let save_key = '/'+config.directory+'/'+contentMd5+extension

    //如果指定空间下已经存在这个文件，则不需要上传、保存
    let isExist:Image = await this.imageRepository.findOne({save_key,bucket:config.bucket})
    if(isExist){
      data.code  =414
      data.message = '上传文件已存在'
      return ''
    }
    let requestUrl = this.apihost+'/'+config.bucket+save_key
    let url = '/'+config.bucket+save_key
    let date:string = new Date(+new Date()+config.request_expire*1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(config,'PUT',url,date,contentMd5)
    let headers
    await new Promise((resolve,reject)=>{
      fs.createReadStream(path).pipe(request.put({
        url:requestUrl,
        headers:{
          'Content-Type':mime.getType(name),
          'Content-Length':size,
          'Content-MD5':contentMd5,
          Authorization,
          Date:date,
          'x-gmkerl-thumb':'/scale/100'
        }
      },(err, res, body)=>{
        if (err) {
          data.code = 415
          data.message = '文件上传失败,网络错误'
          resolve()
          return
        }
        if(res.statusCode === 200){
          data.code = 200
          data.message = '文件上传成功'
          headers = res.headers
          resolve()
          return 
        }
        if(body){
          try{
            let {msg,code,id}  = JSON.parse(body)
            data.code = code
            data.message = msg
          }catch(err){
            data.code = 415
            data.message = '响应体解析错误'
          }
        }else{
          data.code = 415
          data.message = '响应体不存在'
        }
        resolve()
        return
      }))
    })
    if(data.code == 415){
      return ''
    }
    let {'x-upyun-width':width,'x-upyun-height':height,'x-upyun-file-type':type,'x-upyun-frames':frames} = headers
    await this.imageRepository.save({
      name:file.name,
      save_key,
      bucket:config.bucket,
      width,
      height,
      type,
      frames,
      status:'post'})
    return save_key
  }


  async downloadFile(data:any,config:Config,save_key:string){

  }

  //创建指定空间的目录,在保存配置时使用
  async createDirectory(data:any,config:Config,directory:string){
    let {bucket} = config
    if(directory.length==0){
      data.code = 405
      data.message = "指定目录为空字符串"
      return 
    }
    let requestUrl = this.apihost+'/'+bucket+'/'+directory
    let url = '/'+bucket+'/'+directory
    let date:string = new Date(+new Date()+config.request_expire*1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(config,'POST',url,date,null)
    await new Promise((resolve,reject)=>{
      request.post({
        url:requestUrl,
        headers:{
          Authorization,
          Date:date,
          folder:true
        }
      },
      (err, res, body)=>{
        if (err) {
          data.code = 406
          data.message = '目录创建失败，网络错误'
          resolve()
          return
        }
        if(res.statusCode === 200){
          data.code = 200
          data.message = '目录创建成功'
          resolve()
          return
        }
        if(body){
          try{
            let {msg,code,id}  = JSON.parse(body)
            data.code = code
            data.message = msg
          }catch(err){
            data.code = 405
            data.message = '响应体解析错误'
          }
        }else{
          data.code = 405
          data.message = '响应体不存在'
        }
        resolve()
        return
      })
    })
    return 
  }

  //删除指定文件，在回调通知中保存预处理结果后删除原文件用
  async deleteFile(data:any,config:Config,save_key:string):Promise<void>{
    let requestUrl = this.apihost+'/'+config.bucket+save_key
    let date:string = new Date(+new Date()+config.request_expire*1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(config,'DELETE','/'+config.bucket+save_key,date,'')
    await new Promise((resolve,reject)=>{
      request.delete({
        url:requestUrl,
        headers:{
          Authorization,
          Date:date
        }
      },(err, res, body)=>{
        console.log(err)
        //console.log(res)
        console.log(body)
        if(err){
          data.code = 460
          data.message = '删除文件失败'
          resolve()
          return
        }
        if(res.statusCode == 200){
          data.code = 200
          data.message = '删除文件成功'
          resolve()
          return
        }
        if(body){
          try{
            let {msg,code,id}  = JSON.parse(body)
            data.code = code
            data.message = msg
          }catch(err){
            data.code = 460
            data.message = '响应体解析错误'
          }
        }else{
          data.code = 460
          data.message = '响应体不存在'
        }
        resolve()
        return
      });
    })
    return 
  }

  
  async fileList(){
  }

}