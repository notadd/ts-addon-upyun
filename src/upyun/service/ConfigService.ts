import { Repository, getManager, getConnection, Connection } from 'typeorm'
import { Component, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RestfulUtil } from '../util/RestfulUtil';
import { AuthUtil } from '../util/AuthUtil'
import { ImageConfig } from '../model/ImageConfig';
import { AudioConfig } from '../model/AudioConfig';
import { VideoConfig } from '../model/VideoConfig';
import { Document } from '../model/Document'
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio'
import { Video } from '../model/Video'
import { Image } from '../model/Image';
import { File } from '../model/File'
import { BucketConfig } from '../interface/config/BucketConfig'
import { VideoFormatConfig } from '../interface/config/VideoFormatConfig'
import { AudioFormatConfig } from '../interface/config/AudioFormatConfig'
import { ImageFormatConfig } from '../interface/config/ImageFormatConfig'
import { EnableImageWatermarkConfig } from '../interface/config/EnableImageWatermarkConfig'
import * as  fs   from 'fs'
import * as  crypto from  'crypto'
import * as  request   from  'request'

/* 配置服务组件，包含了保存公有空间、私有空间、格式、水印等配置项的功能
   还可以获取公有、私有配置  
*/
@Component()
export class ConfigService {

  constructor(
    private readonly restfulUtil: RestfulUtil,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>,
    @InjectRepository(ImageConfig) private readonly imageConfigRepository: Repository<ImageConfig>,
    @InjectRepository(AudioConfig) private readonly audioConfigRepository: Repository<AudioConfig>,
    @InjectRepository(VideoConfig) private readonly videoConfigRepository: Repository<VideoConfig>
  ) { }


  async saveBucketConfig(data: any, body: BucketConfig): Promise<Bucket> {
    let exist: Bucket
    if (body.isPublic) {
      exist = await this.bucketRepository.findOneById(1)
    } else {
      exist = await this.bucketRepository.findOneById(2)
    }
    if (exist) {
      try {
        await this.bucketRepository.updateById(exist.id, {
          name: body.name,
          operator: body.operator,
          password: body.password,
          directory: body.directory,
          base_url: body.base_url,
          request_expire: +body.request_expire
        })
        data.code = 200
        data.message = '空间配置更新成功'
      } catch (err) {
        data.code = 401
        data.message = '空间配置更新失败' + err.toString()
      }
      return exist
    }
    let bucket: Bucket = new Bucket()
    bucket.name = body.name
    bucket.operator = body.operator
    bucket.password = crypto.createHash('md5').update(body.password).digest('hex')
    bucket.directory = body.directory
    bucket.base_url = body.base_url
    bucket.request_expire = +body.request_expire
    let audio_config = new AudioConfig()
    let video_config = new VideoConfig()
    let image_config = new ImageConfig()
    if (body.isPublic) {
      bucket.id = 1
      bucket.public_or_private = 'public'
      audio_config.id = 1
      video_config.id = 1
      image_config.id = 1
      bucket.audio_config = audio_config
      bucket.video_config = video_config
      bucket.image_config = image_config

    } else {
      bucket.id = 2
      bucket.public_or_private = 'private'
      bucket.token_expire = +body.token_expire
      bucket.token_secret_key = body.token_secret_key
      audio_config.id = 2
      video_config.id = 2
      image_config.id = 2
      bucket.audio_config = audio_config
      bucket.video_config = video_config
      bucket.image_config = image_config
    }
    try {
      //这里级联不起作用，需要另外保存
      await this.audioConfigRepository.save(audio_config)
      await this.videoConfigRepository.save(video_config)
      await this.imageConfigRepository.save(image_config)
      await this.bucketRepository.save(bucket)
      data.code = 200
      data.message = '空间保存成功'
      return bucket
    } catch (err) {
      data.code = 401
      data.message = '空间保存失败' + err.toString()
      return null
    }
  }


  async saveImageFormatConfig(data: any, body: ImageFormatConfig): Promise<any> {
    let { format } = body
    format = format.toLowerCase()
    if (format != 'raw' && format != 'webp_damage' && format != 'webp_undamage') {
      data.code = 401
      data.message = '保存格式不正确'
      return
    }

    let buckets: Bucket[] = await this.bucketRepository.find({ relations: ["image_config"] })
    if (buckets.length !== 2) {
      data.code = 402
      data.message = '空间配置不存在'
      return
    }
    try {
      await buckets.forEach(async (bucket) => {
        await this.imageConfigRepository.updateById(bucket.image_config.id,{format})
      })
      data.code = 200
      data.message = '图片保存格式配置成功'
      return
    } catch (err) {
      data.code = 403
      data.message = '图片保存格式配置失败' + err.toString()
      return
    }
  }



  async saveEnableImageWatermarkConfig(data: any, body: EnableImageWatermarkConfig): Promise<void> {
    let buckets: Bucket[] = await this.bucketRepository.find({ relations: ["image_config"] })
    if (buckets.length !== 2) {
      data.code = 401
      data.message = '空间配置不存在'
      return
    }
    let watermark_enable: number
    if (body.enable) {
      watermark_enable = 1
    } else {
      watermark_enable = 0
    }
    try {
      await buckets.forEach(async (bucket) => {
        await this.imageConfigRepository.updateById(bucket.image_config.id,{watermark_enable})
      })
      data.code = 200
      data.message = '水印启用配置成功'
      return
    } catch (err) {
      data.code = 402
      data.message = '水印启用保存失败' + err.toString()
      return
    }
  }

  async saveImageWatermarkConfig(data:any,file:any,obj:any): Promise<void> {
    let buckets: Bucket[] = await this.bucketRepository.find({ relations: ["image_config"] })
    let type = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase()
    if (buckets.length !== 2) {
      data.code = 401
      data.message = '空间配置不存在'
      return
    }
    let md5 = crypto.createHash('md5').update(fs.readFileSync(file.path)).digest('hex')

    for (let i = 0; i < buckets.length; i++) {
      let image: Image = new Image()
      //这里有坑，如果之前使用了await bucket.images，那么这个bucket的性质会改变，即便这样关联，最后image中仍旧没有bucketId值
      image.bucket = buckets[i]
      image.raw_name = file.name
      //图片文件名为md5_时间戳
      image.name = md5 + '_' + (+new Date())
      image.type = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase()
      image.size = file.size
      image.md5 = md5
      image.status = 'post'
      let { width, height, frames } = await this.restfulUtil.uploadFile(data, buckets[i], image, file)
      if (data.code === 402) {
        break
      }
      let {file_size,file_md5} = await this.restfulUtil.getFileInfo(data,buckets[i],image)
      image.width = width
      image.height = height
      image.frames = frames
      image.size = file_size
      try {
        await this.imageRepository.save(image)
        data.code = 200
        data.message = '保存水印图片成功'
      } catch (err) {
        data.code = 403
        data.message = '保存水印图片出现错误' + err.toString()
      }
      if (data.code === 403) {
        break
      }

      try {
        await this.imageConfigRepository.updateById(buckets[i].image_config.id,{
          watermark_save_key:'/' + buckets[i].directory + '/' + image.name + '.' + image.type,
          watermark_gravity:obj.gravity,
          watermark_opacity:obj.opacity,
          watermark_ws:obj.ws,
          watermark_x:obj.x,
          watermark_y: obj.y
        })
      } catch (err) {
        data.code = 403
        data.message = '保存水印配置出现错误' + err.toString()
      }
      if (data.code === 403) {
        break
      }
    }
    fs.unlinkSync(file.path)
    if (data.code === 402 || data.code === 403) {
      return
    }
  }

  async saveAudioFormatConfig(data: any, body: AudioFormatConfig): Promise<any> {
    let { format } = body
    format = format.toLowerCase()
    if (format != 'raw' && format != 'mp3' && format != 'aac') {
      data.code = 401
      data.message = '保存格式不正确'
      return
    }

    let buckets: Bucket[] = await this.bucketRepository.find({ relations: ["audio_config"] })
    if (buckets.length !== 2) {
      data.code = 402
      data.message = '空间配置不存在'
      return
    }
    try {
      await buckets.forEach(async (bucket) => {
        await this.audioConfigRepository.updateById(bucket.audio_config.id,{format})
      })
      data.code = 200
      data.message = '音频保存格式配置成功'
      return
    } catch (err) {
      data.code = 403
      data.message = '音频保存格式配置失败' + err.toString()
      return
    }
  }

  async saveVideoFormatConfig(data: any, body: VideoFormatConfig): Promise<any> {
    let { format, resolution } = body
    format = format.toLowerCase()
    if (format != 'raw' && format != 'vp9' && format != 'h264' && format != 'h265') {
      data.code = 401
      data.message = '编码格式不正确'
      return
    }
    resolution = resolution.toLowerCase()
    if (resolution != 'raw' && resolution != 'p1080' && resolution != 'p720' && resolution != 'p480') {
      data.code = 401
      data.message = '分辨率格式不正确'
      return
    }

    let buckets: Bucket[] = await this.bucketRepository.find({ relations: ["video_config"] })
    if (buckets.length !== 2) {
      data.code = 402
      data.message = '空间配置不存在'
      return
    }
    try {
      await buckets.forEach(async (bucket) => {
        await this.videoConfigRepository.updateById(bucket.video_config.id,{format,resolution})
      })
      data.code = 200
      data.message = '视频保存格式配置成功'
      return
    } catch (err) {
      data.code = 403
      data.message = '视频保存格式配置失败' + err.toString()
      return
    }
  }
}
