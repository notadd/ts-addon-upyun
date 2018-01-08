import { Component, Inject,forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUtil } from '../util/AuthUtil'
import { Bucket } from '../model/Bucket'
import { File } from '../model/File'
import { Image} from '../model/Image'
import { Directory } from '../model/Directory';
import { WSAEACCES } from 'constants';
const fs  = require('fs')
const crypto = require('crypto')
const request = require('request')
const mime = require('mime')

/* 包含了restfulAPI的各种功能 
   删除文件、创建目录、删除目录、获取文件信息、获取目录文件列表、获取服务使用量
*/
@Component()
export class RestfulUtil{

  private readonly apihost = 'http://v0.api.upyun.com'

  constructor(
    private readonly authUtil:AuthUtil,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>){}


  //上传文件，其中文件信息来自于formidable解析得到的File对象
  async uploadFile(data:any,bucket:Bucket,directory:Directory,file:any,md5:string):Promise<void>{
    
    let contentMd5 = md5
    let name = file.name
    if(!contentMd5){
        contentMd5 = crypto.createHash('md5').update(fs.readFileSync(file.path)).digest('hex')
    }
    let extension:string = name.substr(name.lastIndexOf('.'))
    let save_key = '/'+directory.name+'/'+md5+extension
    let parent:Directory = directory.parent
    while(parent.level!=0){
        save_key = ('/'+parent.name).concat(save_key)
        parent = parent.parent
    }
    let requestUrl = this.apihost+'/'+bucket.name+save_key
    let url = '/'+bucket.name+save_key
    let date:string = new Date(+new Date()+bucket.request_expire*1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket,'PUT',url,date,contentMd5)
    let headers
    await new Promise((resolve,reject)=>{
      fs.createReadStream(file.path).pipe(request.put({
        url:requestUrl,
        headers:{
          'Content-Type':mime.getType(name),
          'Content-Length':file.size,
          'Content-MD5':contentMd5,
          Authorization,
          Date:date,
          'x-gmkerl-thumb':'/scale/100'
        }
      },(err, res, body)=>{
        if (err) {
          data.code = 408
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
            data.code = 408
            data.message = '响应体解析错误'
          }
        }else{
          data.code = 408
          data.message = '响应体不存在'
        }
        resolve()
        return
      }))
    })
    if(data.code == 408){
      return 
    }
    return
  }

  /* 下载指定文件并且将得到的响应体发送给response对象
     @Param data:状态码
     @Param bucket：文件所属空间
     @Param directory：文件所属目录
     @Param file：文件对象
     @Param res：要获取文件的响应
  */
  async downloadFile(data:any,bucket:Bucket,directory:Directory,file:File,res:any){

  }

  /*创建指定空间里的指定目录，前置判定父目录必须存在 
      @Param data：状态码
      @Param bucket：目录所属空间
      @Param directory：端点目录对象
  */
  async createDirectory(data:any,bucket:Bucket,directory:Directory){
    let path = '/'+directory.name
    let parent:Directory = directory.parent
    while(parent.level!=0){
        path = ('/'+parent.name).concat(path)
        parent = parent.parent
    }
    let requestUrl = this.apihost+'/'+bucket.name+path
    let url = '/'+bucket.name+path
    let date:string = new Date(+new Date()+bucket.request_expire*1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket,'POST',url,date,null)
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

  /* 删除指定空间、目录下指定文件
     @Param data:状态码
     @Param bucket：文件所属空间
     @Param directory：文件所属目录
     @Param file：文件对象
   */
  async deleteFile(data:any,bucket:Bucket,directory:Directory,file:File):Promise<void>{
    let save_key = '/'+directory.name+'/'+file.md5+'.'+file.type
    let parent:Directory = directory.parent
    while(parent.level!=0){
        save_key = ('/'+parent.name).concat(save_key)
        parent = parent.parent
    }
    let requestUrl = this.apihost+'/'+bucket.name+save_key
    let url = '/'+bucket.name+save_key
    let date:string = new Date(+new Date()+bucket.request_expire*1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket,'DELETE',url,date,'')
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