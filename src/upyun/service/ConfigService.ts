import { Component, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository,getManager, getConnection ,Connection } from 'typeorm'
import { RestfulUtil } from '../util/RestfulUtil';
import { AuthUtil } from '../util/AuthUtil'
import { Document } from '../model/Document'
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio'
import { Video } from '../model/Video'
import { Image } from '../model/Image';
import { File } from '../model/File'
import { BucketConfig } from '../interface/config/BucketConfig'
import { FormatConfig } from '../interface/config/FormatConfig'
import { EnableWatermarkConfig } from '../interface/config/EnableWatermarkConfig'
const fs  = require('fs')
const crypto = require('crypto')
const request = require('request')
const connectionOptions = require('../typeormConfig.json')

/* 配置服务组件，包含了保存公有空间、私有空间、格式、水印等配置项的功能
   还可以获取公有、私有配置  
*/
@Component()
export class ConfigService {

  private publicBucket:Bucket
  
  private privateBucket:Bucket
  

  constructor(
    private readonly restfulUtil:RestfulUtil,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>){}



  //根据属性查找单个配置对象
  async findOne(bucket:any):Promise<Bucket>{
      return await this.bucketRepository.findOne(bucket)
  }


  async saveBucketConfig(data:any,body:BucketConfig):Promise<Bucket>{ 
    let bucket:Bucket = new Bucket()
    bucket.name = body.name
    bucket.operator = body.operator
    bucket.password = crypto.createHash('md5').update(body.password).digest('hex')
    bucket.directory = body.directory
    bucket.base_url = body.base_url
    bucket.request_expire = +body.request_expire
    if(body.isPublic){
      bucket.id = 1
      bucket.public_or_private = 'public'
    }else{
      bucket.id = 2
      bucket.public_or_private = 'private'
      bucket.token_expire  = +body.token_expire
      bucket.token_secret_key = body.token_secret_key
    }
    try{
      await this.bucketRepository.save(bucket)
      data.code = 200
      data.message = '空间保存成功'
      return bucket
    }catch(err){
      data.code  = 401
      data.message = '空间保存失败'+err.toString()
      return null
    }
  }
  

  async saveFormatConfig(data:any,body:FormatConfig):Promise<any>{
    let {format} = body
    format = format.toLowerCase()
    if(format!='raw'&&format!='webp_damage'&&format!='webp_undamage'){
      data.code = 401
      data.message = '保存格式不正确'
      return
    }

    let buckets:Bucket[] = await this.bucketRepository.find()
    if(buckets.length!==2){
      data.code = 402
      data.message = '空间配置不存在'
      return
    }
    try{
      await buckets.forEach(async (bucket)=>{
        bucket.format = format
        await this.bucketRepository.save(bucket)
      })
      data.code = 200
      data.message = '图片保存格式配置成功'
      return
    }catch(err){
      data.code = 403
      data.message  = '图片保存格式配置失败'+err.toString()
      return
    }
  }



  async saveEnableWatermarkConfig(data:any,body:EnableWatermarkConfig):Promise<void>{
    let buckets:Bucket[] = await this.bucketRepository.find()
    if(buckets.length!==2){
      data.code = 401
      data.message = '空间配置不存在'
      return
    }
    let watermark_enable:number
    if(body.enable){
      watermark_enable = 1
    }else{
      watermark_enable = 0
    }
    try{
      await buckets.forEach(async (bucket)=>{
        bucket.watermark_enable = watermark_enable
        await this.bucketRepository.save(bucket)
      })
      data.code = 200
      data.message = '水印启用配置成功'
      return
    }catch(err){
      data.code = 402
      data.message  = '水印启用保存失败'+err.toString()
      return
    }
  }

  async saveWatermarkConfig(data:any,file:any,obj:any):Promise<void>{
    let buckets:Bucket[] = await this.bucketRepository.find()
    let type = file.name.substr(file.name.lastIndexOf('.')+1).toLowerCase()
    if(buckets.length!==2){
      data.code = 401
      data.message = '空间配置不存在'
      return
    }
    let md5 = crypto.createHash('md5').update(fs.readFileSync(file.path)).digest('hex')
    for(let i=0;i<buckets.length;i++){
      //在指定空间下查找md5相同的图片，这里人为md5相同就是同一张图片，图片名也相同
    
      let image:Image = await this.imageRepository.findOne({md5,type,bucketId:buckets[i].id})
      //如果图片已存在，说吗云存储上也存在
      if(image){
        continue
      }
      //图片不存在
      else{
        //先上传
        await this.restfulUtil.uploadFile(data,buckets[i],file,md5)
        if(data.code === 404 ){
          break
        }
        //再保存图片到数据库
        let image:Image = new Image()
        //这里有坑，如果之前使用了await bucket.images，那么这个bucket的性质会改变，即便这样关联，最后image中仍旧没有bucketId值
        image.bucket = buckets[i]
        image.name = file.name
        image.type = file.name.substr(file.name.lastIndexOf('.')+1).toLowerCase()
        image.size = file.size
        image.md5 = md5
        image.status = 'post'
        try{
          await this.imageRepository.save(image)
          data.code = 200
          data.message = '保存水印图片成功'
        }catch(err){
          data.code = 405
          data.message = '保存水印图片出现错误'
        }
        if(data.code === 405){
          break
        }
      }
      //保存空间配置
      buckets[i].watermark_save_key = '/'+buckets[i].directory+'/'+md5+'.'+type
      buckets[i].watermark_gravity = obj.gravity
      buckets[i].watermark_opacity = obj.opacity
      buckets[i].watermark_ws = obj.ws
      buckets[i].watermark_x = obj.x
      buckets[i].watermark_y = obj.y
      try{
        await this.bucketRepository.save(buckets[i])
      }catch(err){
        data.code = 405
        data.message = '保存水印配置出现错误'
      }
      if(data.code === 405){
        break
      }
    }
    fs.unlinkSync(file.path)
    if(data.code === 404 || data.code === 405){
      return
    }
  }
}
