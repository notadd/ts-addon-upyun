import { ApiUseTags, ApiResponse, ApiOperation, ApiConsumes, ApiProduces, ApiImplicitBody} from '@nestjs/swagger';
import { Controller, Get , Post, Request , Response , Body ,Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '../service/ConfigService';
import { FileService } from '../service/FileService'
import { RestfulUtil } from '../util/RestfulUtil';
import { KindUtil } from '../util/KindUtil'
import { AuthUtil } from '../util/AuthUtil'
import { Document } from '../model/Document'
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio'
import { Video } from '../model/Video'
import { Image } from '../model/Image';
import { File } from '../model/File'
import { BucketConfig } from '../interface/config/BucketConfig'
import { FormatConfig } from '../interface/config/FormatConfig'
import { WatermarkConfig } from '../interface/config/WatermarkConfig'
import { EnableWatermarkConfig } from '../interface/config/EnableWatermarkConfig'
const formidable = require('formidable')
const fs = require('fs')

/* 配置控制器，配置公有空间、私有空间、保存格式、启用水印、图片水印 */
@ApiUseTags('Config')
@Controller('upyun/config')
export class ConfigController {

  private readonly gravity:Set<string>

  constructor(
    private readonly kindUtil: KindUtil,
    private readonly resufulUtil: RestfulUtil,
    private readonly configService: ConfigService,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>) {
      this.gravity = new Set(['northwest','north','northeast','west','center','east','southwest','south','southeast'])
    }


  /* 配置空间基本信息 */
  @Post('bucket')
  @ApiOperation({title:'公有空间配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'保存配置成功'})
  @ApiResponse({status:400,description:'缺少参数,或参数无效'})
  @ApiResponse({status:401,description:'空间配置保存失败'})
  @ApiResponse({status:402,description:'目录创建失败'})
  async bucketConfig(@Body() body:BucketConfig):Promise<any>{

    let data = {
      code:200,
      message:""
    }

    let {isPublic,name,operator,password,directory,base_url,request_expire}  = body;

    if(isPublic === undefined || !name || !operator|| !password || !directory || !base_url  || !request_expire){
        data.code = 400
        data.message = '缺少参数'
        return data
    }

    if(isPublic!==true&&isPublic!==false&&isPublic!=='true'&&isPublic!=='false'){
      data.code = 400
      data.message = 'isPublic参数不正确'
      return data
    }
    if(isPublic==='true'){
      body.isPublic=true
    }else if(isPublic==='false'){
      body.isPublic = false
    }

    body.request_expire  = +request_expire
    if(!Number.isInteger(body.request_expire)){
      data.code = 400
      data.message = '请求超时参数为非整数'
      return data
    }else if(body.request_expire<0){
      data.code = 400
      data.message = '请求超时参数小于0'
      return data
    }else if(body.request_expire>1800){
      data.code = 400
      data.message = '请求超时参数大于1800'
      return data
    }

    if(!isPublic){
      body.token_expire  = +body.token_expire
      if(!Number.isInteger(body.token_expire)){
        data.code = 400
        data.message = 'token超时参数为非整数'
        return data
      }else if(body.token_expire<0){
        data.code = 400
        data.message = 'token超时参数小于0'
        return data
      }else if(body.token_expire>1800){
        data.code = 400
        data.message = 'token超时参数大于1800'
        return data
      }
    }

    //保存配置，如果已存在就更新它
    let bucket:Bucket = await this.configService.saveBucketConfig(data,body)
    //空间配置保存失败
    if(data.code == 401){
      return data
    }
    await this.resufulUtil.createDirectory(data,bucket)
    
    return data
  }
 

  /* 保存格式配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
  @Post('format')
  @ApiOperation({title:'保存格式配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'格式配置成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:401,description:'格式参数不正确，格式只能是raw、webp_damage、webp_undamage'})
  @ApiResponse({status:402,description:'空间配置不存在'})
  @ApiResponse({status:403,description:'图片保存格式配置失败'})
  async  formatConfig(@Body() body:FormatConfig):Promise<any>{

    let data = {
      code:200,
      message:""
    }

    let format = body.format

    if(format==undefined||format.length==0){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    //保存公有空间格式
    await this.configService.saveFormatConfig(data,body)
    
    //格式参数不正确、配置不存在、保存失败
    if(data.code == 401 || data.code == 402 ||data.code == 403){
      return data
    }

    return data
  }

  @Post('enableWatermark')
  @ApiOperation({title:'启用水印配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'启用水印配置成功'})
  @ApiResponse({status:400,description:'缺少参数,或者参数错误'})
  @ApiResponse({status:401,description:'空间配置不存在'})
  @ApiResponse({status:402,description:'水印启用保存失败'})
  async  enableWatermark(@Body() body:EnableWatermarkConfig ):Promise<any>{
    let data = {
      code:200,
      message:''
    }
    let {enable} = body

    if(enable===null||enable===undefined){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    //enable参数错误
    if(enable!=='true'&&enable!=='false'&&enable!==true&&enable!==false){
      data.code = 400
      data.message  = '参数错误'
      return data
    }
    if(body.enable==='true'){
      body.enable = true
    }else if(body.enable==='false'){
      body.enable = false
    }

    await this.configService.saveEnableWatermarkConfig(data,body)
    //保存启用水印到数据库失败，无法模仿这个错误
    if(data.code === 401 || data.code === 402){
      return data
    }
    return data
  }

  /* 保存水印配置，目前两个空间采用同一个图片水印，忽略文字水印、忽略多水印 
     水印图片必须与被加水印图片在同一个服务名下，所以需要在两个空间下各保存一次
     为了向前端提供统一接口，这里采用将水印图片上传到服务器，由服务发起restful上传请求的方式
     如果客户端上传，客户端调用会比较繁杂
  */
  @Post('watermark')
  @ApiOperation({title:'图片水印配置接口'})
  @ApiConsumes('application/form-data')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'图片水印配置成功'})
  @ApiResponse({status:400,description:'缺少参数,非法参数、水印图片类型不允许'})
  @ApiResponse({status:401,description:'空间配置不存在，水印图片必须上传到相应空间'})
  @ApiResponse({status:402,description:'请求解析错误'})
  @ApiResponse({status:403,description:'不允许的水印图片类型'})
  @ApiResponse({status:404,description:'上传水印图片失败'})
  @ApiResponse({status:405,description:'保存水印图片信息失败'})
  async  watermarkConfig(@Request() req,@Body() body:WatermarkConfig):Promise<any>{
    let data = {
      code:200,
      message:''
    }
    //解析得到的文件对象(包含了文件临时路径，文件名等信息)，其余字段对象
    let file,obj
    await new Promise((resolve,reject)=>{
      let form = new formidable.IncomingForm();  
      form.parse(req, function(err, fields, files) {  
        if(err){
          //这个错误无法模仿
          data.code = 402
          data.message = '请求解析错误'
          resolve()
          return
        }
        if(!fields||!files||!files.file||!fields.gravity||!fields.x||!fields.y||!fields.opacity||!fields.ws){
          data.code = 400
          data.message = '缺少参数'
          resolve()
          return
        }
        file = files.file
        obj = fields 
        resolve()
        return
      });  
    })
    if(data.code == 400 || data.code == 402){
      return data
    }

    obj.x = +obj.x
    obj.y = +obj.y
    obj.opacity = +obj.opacity
    obj.ws = +obj.ws
    if(!this.gravity.has(obj.gravity)){
      data.code = 400
      data.message = '不允许的水印图片位置'
      return data
    }
    if(!Number.isInteger(obj.x)){
      data.code = 400
      data.message = 'x偏移不是整数'
      return data
    }
    if(!Number.isInteger(obj.y)){
      data.code = 400
      data.message = 'y偏移不是整数'
      return data
    }
    if(!Number.isInteger(obj.opacity)){
      data.code = 400
      data.message = '透明度不是整数'
      return data
    }else if(obj.opacity<=0){
      data.code = 400
      data.message = '透明度不大于0'
      return data
    }else if(obj.opacity>100){
      data.code = 400
      data.message = '透明度大于100'
      return data
    }else{
      
    }
    if(!Number.isInteger(obj.ws)){
      data.code = 400
      data.message = '短边自适应比例不是整数'
      return data
    }else if(obj.ws<=0){
      data.code = 400
      data.message = '短边自适应比例不大于0'
      return data
    }else{
      //暂定短边自适应比例可以大于100
    }
    if(!this.kindUtil.isImage(file.name.substr(file.name.lastIndexOf('.')+1))){
      data.code = 400
      data.message = '不允许的水印图片类型'
      return data
    }
    //保存后台水印配置
    await this.configService.saveWatermarkConfig(data,file,obj)

    if(data.code === 401 || data.code === 402|| data.code === 403 ){
      return data
    }
    return data
  }
}