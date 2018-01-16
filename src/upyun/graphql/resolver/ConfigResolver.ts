import { Query, Resolver, ResolveProperty, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '../../service/ConfigService';
import { FileService } from '../../service/FileService'
import { RestfulUtil } from '../../util/RestfulUtil';
import { KindUtil } from '../../util/KindUtil'
import { AuthUtil } from '../../util/AuthUtil'
import { Document } from '../../model/Document'
import { Bucket } from '../../model/Bucket';
import { Audio } from '../../model/Audio'
import { Video } from '../../model/Video'
import { Image } from '../../model/Image';
import { File } from '../../model/File'
import * as formidable   from 'formidable'
import * as fs from 'fs'

@Resolver('Config')
export class ConfigResolver {

  private readonly gravity: Set<string>

  constructor(
    private readonly kindUtil: KindUtil,
    private readonly restfulUtil: RestfulUtil,
    private readonly configService: ConfigService,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    this.gravity = new Set(['northwest', 'north', 'northeast', 'west', 'center', 'east', 'southwest', 'south', 'southeast'])
  }


  /* 配置空间基本信息 */
  @Mutation('bucket')
  async bucket(req, body) {
    let data = {
      code: 200,
      message: ""
    }
    let { isPublic, name, operator, password, directory, base_url, request_expire } = body;

    if (isPublic === undefined || !name || !operator || !password || !directory || !base_url || !request_expire) {
      data.code = 400
      data.message = '缺少参数'
      return data
    }

    if (isPublic !== true && isPublic !== false && isPublic !== 'true' && isPublic !== 'false') {
      data.code = 400
      data.message = 'isPublic参数不正确'
      return data
    }
    if (isPublic === 'true') {
      body.isPublic = true
    } else if (isPublic === 'false') {
      body.isPublic = false
    }

    body.request_expire = +request_expire
    if (!Number.isInteger(body.request_expire)) {
      data.code = 400
      data.message = '请求超时参数为非整数'
      return data
    } else if (body.request_expire < 0) {
      data.code = 400
      data.message = '请求超时参数小于0'
      return data
    } else if (body.request_expire > 1800) {
      data.code = 400
      data.message = '请求超时参数大于1800'
      return data
    }

    if (!isPublic) {
      body.token_expire = +body.token_expire
      if (!Number.isInteger(body.token_expire)) {
        data.code = 400
        data.message = 'token超时参数为非整数'
        return data
      } else if (body.token_expire < 0) {
        data.code = 400
        data.message = 'token超时参数小于0'
        return data
      } else if (body.token_expire > 1800) {
        data.code = 400
        data.message = 'token超时参数大于1800'
        return data
      }
    }
    //保存配置，如果已存在就更新它
    let bucket: Bucket = await this.configService.saveBucketConfig(data, body)
    //空间配置保存失败
    if (data.code == 401) {
      return data
    }
    await this.restfulUtil.createDirectory(data, bucket)
    return data
  }

  /* 图片保存格式配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
  @Mutation('imageFormat')
  async  imageFormat(req , body):Promise<any>{

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
    //保存格式
    await this.configService.saveImageFormatConfig(data,body)
    //格式参数不正确、配置不存在、保存失败
    if(data.code == 401 || data.code == 402 ||data.code == 403){
      return data
    }
    return data
  }

  
  @Mutation('enableImageWatermark')
  async  enableImageWatermark(req , body):Promise<any>{
    let data = {
      code:200,
      message:''
    }
    //这里在schema中定义为枚举值，接受到参数为string
    let {enable} = body
    if(enable===null||enable===undefined){
      data.code = 400
      data.message = '缺少参数'
      return data
    }
    //enable参数错误
    if(enable!==true&&enable!==false){
      data.code = 400
      data.message  = '参数错误'
      return data
    }
    await this.configService.saveEnableImageWatermarkConfig(data,body)
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
  @Mutation('imageWatermark')
  async  imageWatermarkConfig(req , body):Promise<any>{
    let data = {
      code:200,
      message:''
    }
    let {name,base64,gravity,opacity,x,y,ws}  =body
    fs.writeFileSync(__dirname+'/'+name,Buffer.from(base64,'base64'))
    let obj:any = {}
    let file:any = {}
    obj.x = x
    obj.y = y
    obj.opacity = opacity
    obj.ws = ws
    obj.gravity = gravity
    file.name = name
    file.path = __dirname+'/'+name
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
    await this.configService.saveImageWatermarkConfig(data,file,obj)

    if(data.code === 401 || data.code === 402|| data.code === 403 ){
      return data
    }
    return data
  }

  /* 音频保存格式配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
  @Mutation('audioFormat')
  async  audioFormat(req , body):Promise<any>{
    let data = {
      code:200,
      message:""
    }
    let format = body.format
    if(!format){
      data.code = 400
      data.message = '缺少参数'
      return data
    }
    //保存公有空间格式
    await this.configService.saveAudioFormatConfig(data,body)
    //格式参数不正确、配置不存在、保存失败
    if(data.code == 401 || data.code == 402 ||data.code == 403){
      return data
    }
    return data
  }

  /* 视频保存配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
  @Mutation('videoFormat')
  async videoFormat(req , body):Promise<any>{
    let data = {
      code:200,
      message:""
    }
    let {format,resolution} = body
    if(!format||!resolution){
      data.code = 400
      data.message = '缺少参数'
      return data
    }
    //保存公有空间格式
    await this.configService.saveVideoFormatConfig(data,body)
    //格式参数不正确、配置不存在、保存失败
    if(data.code == 401 || data.code == 402 ||data.code == 403){
      return data
    }

    return data
  }

  /* 获取所有空间信息字段 */
  @Query('buckets')
  async buckets(){
    let data = {
      code:200,
      message:'',
      buckets:[]
    }

    let buckets: Bucket[] = await this.bucketRepository.createQueryBuilder('bucket')
                                                       .select(['bucket.id','bucket.public_or_private','bucket.name'])
                                                       .getMany()
    if(buckets.length!==2){
      data.code = 401
      data.message = '空间配置不存在'
      return data
    }
    data.code = 200
    data.message = '获取空间配置成功'
    data.buckets = buckets
    return data
  }
}