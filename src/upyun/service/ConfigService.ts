import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../model/Config'
const crypto = require('crypto')
const request = require('request')

/* 配置服务组件，包含了保存公有空间、私有空间、格式、水印等配置项的功能
   还可以获取公有、私有配置  
*/
@Component()
export class ConfigService {

  private publicConfig:Config;
  
  private privateConfig:Config
  

  constructor(
    @InjectRepository(Config) private readonly configRepository: Repository<Config>){}


  //获取公有配置、会缓存配置到组件属性，不存在时返回null
  async getPublicConfig(){
    if(!this.publicConfig){
      this.publicConfig = await this.configRepository.findOneById(1)
    }
    return this.publicConfig
  }

  async getPrivateConfig(){
    if(!this.privateConfig){
      this.privateConfig = await this.configRepository.findOneById(2)
    }
    return this.privateConfig
  }


  //根据属性查找单个配置对象
  async findOne(config:any):Promise<Config>{
      return await this.configRepository.findOne(config)
  }

  //保存公有配置
  async savePublicConfig(data:any,bucket:string,operator:string,password:string,base_url:string,directory:string,request_expire:number):Promise<void>{
    let publicConfig = await this.configRepository.findOneById(1)
    //不存在就保存
    if(publicConfig == null){
        try{
          let config:Config = new Config()
          config.id = 1
          config.bucket = bucket
          config.operator = operator
          config.password = crypto.createHash('md5').update(password).digest('hex')
          config.base_url = base_url
          config.directory = directory
          config.request_expire = request_expire
          config.public_or_private = 'public'
          await this.configRepository.save(config)
          data.code = 200
          data.message = "公有空间配置保存成功"
        }catch(err){
          data.code = 401
          data.message = "公有空间配置保存失败"
        }
    }else{
      //存在就更新
      try{
        await  this.configRepository.update({id:1},{
          bucket,
          operator,
          password:crypto.createHash('md5').update(password).digest('hex'),
          base_url:base_url,
          directory,
          request_expire:request_expire})
        data.code = 200
        data.message = "公有空间配置更新成功"
      }catch(err){
        data.code = 402
        data.message = "公有空间配置更新失败"
      } 
    }
    return 
  }


  //私有配置多出两个token相关字段
  async savePrivateConfig(data,bucket,operator,password,base_url,directory,request_expire,token_secret_key,token_expire):Promise<void>{
    let privateConfig = await this.configRepository.findOneById(2)
    if(privateConfig == null){
        try{
          let config = new Config()
          config.id = 2
          config.bucket = bucket
          config.operator = operator
          config.password = crypto.createHash('md5').update(password).digest('hex')
          config.base_url = base_url
          config.directory = directory
          config.request_expire = request_expire
          config.token_secret_key = token_secret_key
          config.token_expire = token_expire
          config.public_or_private = 'private'
          await this.configRepository.save(config)
          data.code = 200
          data.message = "私有空间配置保存成功"
        }catch(err){
          data.code = 403
          data.message = "私有空间配置保存失败"
        }
    }else{
      try{
        password = 
        await  this.configRepository.update({id:2},{
          bucket,
          operator,
          password:crypto.createHash('md5').update(password).digest('hex'),
          base_url:base_url,
          directory,
          request_expire:request_expire,
          token_secret_key:token_secret_key,
          token_expire:token_expire})
        data.code = 200
        data.message = "私有空间配置更新成功"
      }catch(err){
        data.code = 404
        data.message = "私有空间配置更新失败"
      } 
    }
    return 
  }


  async savePublicFormat(data:any,format:string):Promise<any>{

    if(format!='raw'&&format!='webp_damage'&&format!='webp_undamage'){
      data.code = 407
      data.message = '保存格式不正确'
      return
    }

    let publicConfig = await this.configRepository.findOneById(1)
    if(publicConfig == null){
        try{
          let config = new Config()
          config.id = 1
          config.format = format
          await this.configRepository.save(config)
          data.code = 200
          data.message = "格式保存成功"
        }catch(err){
          data.code = 408
          data.message = "格式保存失败"
        }
    }else{
      try{
        await  this.configRepository.update({id:1},{format})
        data.code = 200
        data.message = "格式更新成功"
      }catch(err){
        data.code = 409
        data.message = "格式更新失败"
      } 
    }
    return 
  }


  async savePrivateFormat(data:any,format:string):Promise<any>{
     
    if(format!='raw'&&format!='webp_damage'&&format!='webp_undamage'){
      data.code = 407
      data.message = '保存格式不正确'
      return
    }

    let privateConfig = await this.configRepository.findOneById(2)
    if(privateConfig == null){
        try{
          let config = new Config()
          config.format = format
          await this.configRepository.save(config)
          data.code = 200
          data.message = "格式保存成功"
        }catch(err){
          data.code = 408
          data.message = "格式保存失败"
        }
    }else{
      try{
        await  this.configRepository.update({id:2},{format})
        data.code = 200
        data.message = "格式更新成功"
      }catch(err){
        data.code = 409
        data.message = "格式更新失败"
      } 
    }
    return 
  }

  async saveEnableWatermark(data:any,config:Config,enable:boolean):Promise<void>{
     try{
       await this.configRepository.update(config,{watermark_enable:enable?'true':'false'})
       data.code = 200
       data.message = '水印启用配置成功'
       return
     }catch(err){
       //暂时无法模仿这个错误
      data.code = 412
      data.message = '水印启用配置失败'
      return
     }
  }

  async saveWatermark(data:any,config:Config,saveKey:string,gravity:string,x:number,y:number,opacity:number,ws:number):Promise<void>{
    try{
      await this.configRepository.update(config,{
        watermark_save_key:saveKey,
        watermark_gravity:gravity,
        watermark_opacity:opacity,
        watermark_ws:ws,
        watermark_x:x,
        watermark_y:y
      })
      data.code = 200
      data.message = '水印配置保存成功'
      return
    }catch(err){
      data.code = 416
      data.message = '水印配置保存失败'
      return
    }
  }

}
