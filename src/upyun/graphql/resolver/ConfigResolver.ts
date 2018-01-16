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
const formidable = require('formidable')
const fs = require('fs')

@Resolver('Config')
export class ConfigResolver {

  private readonly gravity: Set<string>

  constructor(
    private readonly kindUtil: KindUtil,
    private readonly restfulUtil: RestfulUtil,
    private readonly configService: ConfigService,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>) {
    this.gravity = new Set(['northwest', 'north', 'northeast', 'west', 'center', 'east', 'southwest', 'south', 'southeast'])
  }

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

}