import { Component, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository,getManager, getConnection ,Connection } from 'typeorm'
import { RestfulUtil } from '../util/RestfulUtil'
import { Image } from '../model/Image'
import { Directory } from '../model/Directory'
import { Bucket } from '../model/Bucket'
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
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>,
    @InjectRepository(Directory) private readonly directoryRepository: Repository<Directory>
  ){}

  //获取公有配置、会缓存配置到组件属性，不存在时返回null
  async getPublicBucket(){
    if(!this.publicBucket){
      this.publicBucket = await this.bucketRepository.findOneById(1)
    }
    return this.publicBucket
  }

  async getPrivateBucket(){
    if(!this.privateBucket){
      this.privateBucket = await this.bucketRepository.findOneById(2)
    }
    return this.privateBucket
  }


  //根据属性查找单个配置对象
  async findOne(bucket:any):Promise<Bucket>{
      return await this.bucketRepository.findOne(bucket)
  }


  async saveBucketConfig(data:any,body:BucketConfig){ 
    let bucket:Bucket = new Bucket()
    bucket.name = body.name
    bucket.operator = body.operator
    bucket.password = crypto.createHash('md5').update(body.password).digest('hex')
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
    let root:Directory = new Directory()
    root.bucket_name = body.name
    root.children  = new Array<Directory>()
    root.parent = null
    root.images = new Array<Image>()
    root.level = 0
    root.name  = '#'+body.name+'_root'
    bucket.root = root
    try{
      await this.bucketRepository.save(bucket)
      data.code = 200
      data.message = '空间保存成功'
      return
    }catch(err){
      data.code  = 401
      data.message = '空间保存失败'+err.toString()
      return
    }
  }
  

  async saveFormatConfig(data:any,body:FormatConfig):Promise<any>{
    let {format} = body
    format = format.toLowerCase()
    if(format!='raw'&&format!='webp_damage'&&format!='webp_undamage'){
      data.code = 402
      data.message = '保存格式不正确'
      return
    }

    let buckets:Bucket[] = await this.bucketRepository.find()
    if(buckets.length!==2){
      data.code = 403
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
      data.code = 404
      data.message  = '图片保存格式配置失败'+err.toString()
      return
    }
  }



  async saveEnableWatermarkConfig(data:any,body:EnableWatermarkConfig):Promise<void>{
    let buckets:Bucket[] = await this.bucketRepository.find()
    if(buckets.length!==2){
      data.code = 403
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
      data.code = 405
      data.message  = '水印启用保存失败'+err.toString()
      return
    }
  }

  async saveWatermarkConfig(data:any,file:any,obj:any):Promise<void>{
    let buckets:Bucket[] = await this.bucketRepository.find()
    if(buckets.length!==2){
      data.code = 403
      data.message = '空间配置不存在'
      return
    }
    let md5 = crypto.createHash('md5').update(fs.readFileSync(file.path)).digest('hex')
    for(let i=0;i<buckets.length;i++){
      await this.restfulUtil.uploadFile(data,buckets[i],buckets[i].root,file,md5)
      if(data.code === 408 ){
        break
      }
    }
    fs.unlinkSync(file.path)
    if(data.code === 408 ){
      return
    }
    
    let connection:Connection =  getConnection(connectionOptions.name)
    const usedQueryRunner = connection.createQueryRunner("master");
    const transactionEntityManager = connection.createEntityManager(usedQueryRunner);
    try {
        await usedQueryRunner.startTransaction();
        for(let i=0;i<buckets.length;i++){
          let image:Image = new Image()
          image.bucket_name = buckets[i].name
          image.name = file.name
          image.type = file.name.substr(file.name.lastIndexOf('.')+1).toLowerCase()
          image.size = file.size
          image.md5 = md5
          image.status = 'post'
          image.directory = buckets[i].root
          buckets[i].root.images.add(image)
          transactionEntityManager.save(buckets[i].root)
        }
        await usedQueryRunner.commitTransaction();
    }catch (err) {
        try { 
            await usedQueryRunner.rollbackTransaction();
            data.code = 409
            data.message = '保存水印图片出现错误'
        } catch (rollbackError) {
            data.code = 409
            data.message = '保存水印图片中出现回滚错误'
        }
    }finally {
        if (usedQueryRunner) 
            await usedQueryRunner.release();
    }
    if(data.code === 409){
      return
    }
  }
}
