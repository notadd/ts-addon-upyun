import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../model/Config'
import { Image } from '../model/Image'
const crypto = require('crypto')

/* 验证签名服务组件，包含获取头信息签名、请求体签名、token、回调通知验签等功能 */
@Component()
export class AuthUtil {

  constructor(){}


  /* 获取请求头信息中签名，restfulAPI与form回调通知签名使用这种签名方式
    @Param data：响应信息
    @Param isPublic：是否为公有空间操作
    @Param url：请求url，即不包含域名、查询字符串之前的部分，对于回调通知为/image/notify
    @Param method：请求方法，回调通知为异步时为post
    @Param contentMd5：请求体md5值，回调通知时获取请求体中的json字符串
  */
  async getHeaderAuth(config:Config,method:string,url:string,date:string,contentMd5:string):Promise<string>{
    let ori = ''
    ori += method.toUpperCase()+'&'
    ori += url+'&'
    ori += date
    if(contentMd5 && contentMd5!==''){
        ori += '&'+contentMd5
    }
    let signTemp = crypto.createHmac('sha1', config.password).update(ori).digest().toString('base64')
    return 'UPYUN '+config.operator+':'+signTemp
  }


  /* 获取请求体信息签名，form表单上传采用这种签名方式
     @Param data：响应信息
     @Param isPublic：是否是公有空间
     @Param method：请求方法
     @Param policy：上传参数对象
  */
  async getBodyAuth(config:Config,method:string,policy:any):Promise<string>{
    let ori = ''
    ori += method.toUpperCase()+'&'
    ori += '/'+policy['bucket']+'&'
    ori += policy.date+'&'
    //拼接上传参数json字符串的base64编码
    ori += Buffer.from(JSON.stringify(policy)).toString('base64')
    if(policy['content-md5'] && policy['content-md5']!==''){
        ori += '&'+policy['content-md5']
    }
    let signTemp = crypto.createHmac('sha1', config.password).update(ori).digest('base64')
    return 'UPYUN '+config.operator+':'+signTemp
  }


  /* 获取访问私有空间图片token
     @Param 访问图片的url
  */
  async getToken(config:Config,url:string){
    //生成过期时间戳
    let expireTime = Date.now()*1 + config.token_expire
    let str = config.token_secret_key+'&'+expireTime+'&'+url
    let md5  = crypto.createHash('md5').update(str).digest('hex')
    //获取中间8位
    let middle8 =  md5.substring(12,20)
    return middle8+expireTime
  }

  /* 验证回调签名 
     @Param auth：回调响应头信息中签名字符串
     @Param save_key：回调信息中图片保存路径
     @Param url：回调通知url
     @Param method：回调通知方法，异步情况下问post
     @Param body：回调通知请求体对象
  */
  async notifyVerify(auth:string,config:Config,method:string,url:string,date:string,contentMd5:string,body:any):Promise<boolean>{
    let rawBody = ''
    let keys = Object.keys(body)
    keys.forEach((key,index)=>{
      if(body[key]&&!isNaN(parseInt(body[key]))){
        body[key] = parseInt(body[key])
      }
      rawBody+=key+'='+encodeURIComponent(body[key])
      if(index<keys.length-1){
        rawBody+='&'
      }
    })
    let md5 = crypto.createHash('md5').update(rawBody).digest('hex')
    if(md5!==contentMd5){
      return false
    }
    //生成签名
    let ori = ''
    ori += method.toUpperCase()+'&'
    ori += url+'&'
    ori += date+'&'
    ori += contentMd5
    let localSign = crypto.createHmac('sha1', config.password).update(ori).digest('base64')
    //获取响应头信息中签名字符串
    let remoteSign = auth.substr(auth.lastIndexOf(':')+1)
    if(localSign === remoteSign){
      return true
    }
    return false
  }
   
}
