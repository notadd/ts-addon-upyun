import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../model/Config'
import { Image } from '../model/Image'
const crypto = require('crypto')

/* 验证签名服务组件，包含获取头信息签名、请求体签名、token、回调通知验签等功能 */
@Component()
export class StatusCodeUtil {

  constructor(){}

}