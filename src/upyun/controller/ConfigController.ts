import { Controller, Get , Post, Request , Response , Body ,Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiUseTags, ApiResponse, ApiOperation, ApiConsumes, ApiProduces, ApiImplicitBody} from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { RestfulService } from '../service/RestfulService';
import { ConfigService } from '../service/ConfigService';
import { Config } from '../model/Config';
import { Image } from '../model/Image';
import { PublicConfig } from '../interface/config/PublicConfig'
import { PrivateConfig } from '../interface/config/PrivateConfig'
import { FormatConfig } from '../interface/config/FormatConfig'
import { WatermarkConfig } from '../interface/config/WatermarkConfig'
import { EnableWatermarkConfig } from '../interface/config/EnableWatermarkConfig'
const formidable = require('formidable')
const fs = require('fs')

/* 配置控制器，配置公有空间、私有空间、保存格式、水印 */
@ApiUseTags('Config')
@Controller('upyun/config')
export class ConfigController {

  private readonly gravity:Set<string>
  private readonly extension:Set<string>

  constructor(
    private readonly configService: ConfigService,
    private readonly restfulService: RestfulService,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>) {
      this.gravity = new Set(['northwest','north','northeast','west','center','east','southwest','south','southeast'])
      this.extension = new Set(['jpg','jpeg','png'])
    }


  /* 配置公有空间 */
  @Post('public')
  @ApiOperation({title:'公有空间配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'保存配置成功'})
  @ApiResponse({status:400,description:'缺少参数,或参数无效'})
  @ApiResponse({status:401,description:'公有空间配置保存失败'})
  @ApiResponse({status:402,description:'公有空间配置更新失败'})
  @ApiResponse({status:405,description:'目录为空'})
  @ApiResponse({status:406,description:'云存储上创建目录失败'})
  async publicConfig(@Body() body:PublicConfig):Promise<any>{

    let data = {
      code:200,
      message:""
    }

    let {bucket,operator,password,base_url,directory,request_expire}  = body;
    if(!bucket || !operator|| !password || !base_url || directory==null || !request_expire){
        data.code = 400
        data.message = '缺少参数'
        return data
    }

    request_expire  = +request_expire
    if(!Number.isInteger(request_expire)){
      data.code = 400
      data.message = '请求超时参数为非整数'
      return data
    }else if(request_expire<0){
      data.code = 400
      data.message = '请求超时参数小于0'
      return data
    }else if(request_expire>1800){
      data.code = 400
      data.message = '请求超时参数大于1800'
      return data
    }

    //保存配置，如果已存在就更新它
    await this.configService.savePublicConfig(data,bucket,operator,password,base_url,directory,request_expire)
    
    //公有空间配置保存、更新失败
    if(data.code == 401 || data.code == 402){
      return data
    }
    
    let config:Config = await this.configService.getPublicConfig()
    //创建相应空间目录
    await this.restfulService.createDirectory(data,config,directory) 

    //目录为空或者创建目录失败
    if(data.code == 405 || data.code == 406){
      return data
    }
    return data
  }


  /* 配置私有空间，如果已存在就更新它 */
  @Post('private')
  @ApiOperation({title:'私有空间配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'保存配置成功'})
  @ApiResponse({status:400,description:'缺少参数,或参数无效'})
  @ApiResponse({status:403,description:'私有空间配置保存失败'})
  @ApiResponse({status:404,description:'私有空间配置更新失败'})
  @ApiResponse({status:405,description:'目录为空'})
  @ApiResponse({status:406,description:'云存储上创建目录失败'})
  async privateConfig(@Body() body:PrivateConfig):Promise<any>{

    let data = {
      code:200,
      message:""
    }

    let {bucket,operator,password,base_url,directory,request_expire,token_secret_key,token_expire}  = body;
  
    if(!bucket || !operator || !password || !base_url || directory == null 
      || !request_expire || !token_secret_key|| !token_expire){
        data.code = 400
        data.message = '缺少参数'
        return data
    }

    request_expire  = +request_expire
    token_expire = +token_expire
    if(!Number.isInteger(request_expire)){
      data.code = 400
      data.message = '请求超时参数为非整数'
      return data
    }else if(request_expire<0){
      data.code = 400
      data.message = '请求超时参数小于0'
      return data
    }else if(request_expire>1800){
      data.code = 400
      data.message = '请求超时参数大于1800'
      return data
    }
    
    if(!Number.isInteger(token_expire)){
      data.code = 400
      data.message = 'token超时参数为非整数'
      return data
    }else if(token_expire<0){
      data.code = 400
      data.message = 'token超时参数小于0'
      return data
    }else if(token_expire>1800){
      data.code = 400
      data.message = 'token超时参数大于1800'
      return data
    }
    

    //保存配置，如果已存在就更新它
    await this.configService.savePrivateConfig(data,bucket,operator,password,base_url,directory,request_expire,token_secret_key,token_expire)
    
    //私有空间保存、更新失败
    if(data.code == 403 || data.code == 404){
      return data
    }
    
    let config:Config = await this.configService.getPrivateConfig()
    //创建私有空间目录
    await this.restfulService.createDirectory(data,config,directory) 

    if(data.code == 405 || data.code == 406){
      return data
    }
    return data

  }


  /* 保存格式配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
  @Post('format')
  @ApiOperation({title:'保存格式配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'格式配置成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:407,description:'参数不正确，格式只能是raw、webp_damage、webp_undamage'})
  @ApiResponse({status:408,description:'格式配置保存失败'})
  @ApiResponse({status:409,description:'格式配置更新失败'})
  async  formatConfig(@Body() body:FormatConfig):Promise<any>{

    let data = {
      code:200,
      message:""
    }

    let format = body.format

    if(format==null||format.length==0){
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    //保存公有空间格式
    await this.configService.savePublicFormat(data,format)
    
    //格式参数不正确、保存、更新失败
    if(data.code == 407 || data.code == 408 ||data.code == 409){
      return data
    }

    //保存私有空间格式
    await this.configService.savePrivateFormat(data,format)
    
    if(data.code == 407 || data.code == 408 ||data.code == 409){
      return data
    }

    return data
  }

  @Post('enableWatermark')
  @ApiOperation({title:'启用水印配置接口'})
  @ApiConsumes('application/x-www-form-urlencoded','application/json')
  @ApiProduces('application/json')
  @ApiResponse({status:200,description:'启用水印配置成功'})
  @ApiResponse({status:400,description:'缺少参数'})
  @ApiResponse({status:410,description:'参数错误'})
  @ApiResponse({status:411,description:'空间配置不存在，只有空间存在才能使用水印'})
  @ApiResponse({status:412,description:'保存到数据库失败'})
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
      data.code = 410
      data.message  = '参数错误'
      return data
    }
    enable = !!enable

    let publicConfig:Config = await this.configService.getPublicConfig()
    let privateConfig:Config = await this.configService.getPrivateConfig()
 
    //配置水印时要求空间配置必须存在，因为图片要上传到空间
    if(!publicConfig||!privateConfig){
      data.code = 411
      data.message = '空间配置不存在'
      return data
    }

    await this.configService.saveEnableWatermark(data,publicConfig,enable)
    //保存启用水印到数据库失败，无法模仿这个错误
    if(data.code == 412){
      return data
    }
    await this.configService.saveEnableWatermark(data,privateConfig,enable)
    if(data.code == 412){
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
  @ApiResponse({status:411,description:'空间配置不存在，水印图片必须上传到相应空间'})
  @ApiResponse({status:413,description:'请求解析错误'})
  @ApiResponse({status:415,description:'上传水印图片失败'})
  @ApiResponse({status:416,description:'保存水印图片信息失败'})
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
          data.code = 413
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
    if(data.code == 400 || data.code == 413){
      return data
    }
    //水印参数
    let {gravity,x,y,opacity,ws} = obj
    x = +x
    y = +y
    opacity = +opacity
    ws = +ws
    if(!this.extension.has(file.name.substr(file.name.lastIndexOf('.')+1))){
      data.code = 400
      data.message = '不允许的水印图片类型'
      return data
    }
    if(!this.gravity.has(gravity)){
      data.code = 400
      data.message = '不允许的水印图片位置'
      return data
    }
    if(!Number.isInteger(x)){
      data.code = 400
      data.message = 'x偏移不是整数'
      return data
    }
    if(!Number.isInteger(y)){
      data.code = 400
      data.message = 'y偏移不是整数'
      return data
    }
    if(!Number.isInteger(opacity)){
      data.code = 400
      data.message = '透明度不是整数'
      return data
    }else if(opacity<=0){
      data.code = 400
      data.message = '透明度不大于0'
      return data
    }else if(opacity>100){
      data.code = 400
      data.message = '透明度大于100'
      return data
    }else{

    }

    if(!Number.isInteger(ws)){
      data.code = 400
      data.message = '短边自适应比例不是整数'
      return data
    }else if(ws<=0){
      data.code = 400
      data.message = '短边自适应比例不大于0'
      return data
    }else{
      //暂定短边自适应比例可以大于100
    }
    

    let publicConfig:Config = await this.configService.getPublicConfig()
    let privateConfig:Config = await this.configService.getPrivateConfig()
    //配置水印时要求空间配置必须存在，因为图片要上传到空间
    if(!publicConfig||!privateConfig){
      data.code = 411
      data.message = '空间配置不存在'
      return data
    }

    
    //分别向公有空间、私有空间上传文件，返回各自的save_key，因为目录可能不同
    let publicSaveKey = await this.restfulService.uploadFile(data,publicConfig,file)
    if(data.code == 415 || data.code >1000){
      fs.unlinkSync(file.path)
      return data
    }else if(data.code = 414){
      //水印图片已存在空间中，直接使用即可
    }else{
    }

    let privateSaveKey = await this.restfulService.uploadFile(data,privateConfig,file)
    //文件上传失败
    if(data.code == 415 || data.code >1000){
      fs.unlinkSync(file.path)
      return data
    }else if(data.code = 414){
      //上传文件已存在
      data.code = 200
      fs.unlinkSync(file.path)
    }else{
      fs.unlinkSync(file.path)
    }
    
    //保存后台水印配置
    await this.configService.saveWatermark(data,publicConfig,publicSaveKey,gravity,x,y,opacity,ws)
    //暂定水印配置保存失败时，不删除数据库与云存储文件信息
    //这个错误无法模仿
    if(data.code == 416){
      return data
    }
    await this.configService.saveWatermark(data,privateConfig,privateSaveKey,gravity,x,y,opacity,ws)
    if(data.code == 416){
      return data
    }

    return data
  }

}