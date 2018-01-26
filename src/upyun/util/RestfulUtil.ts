import { Component, Inject } from '@nestjs/common';
import { AuthUtil } from '../util/AuthUtil'
import { Document } from '../model/Document'
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio'
import { Video } from '../model/Video'
import { Image } from '../model/Image';
import { File } from '../model/File'
const fs = require('fs')
const crypto = require('crypto')
const request = require('request')
const mime = require('mime')

/* 包含了restfulAPI的各种功能 
   删除文件、创建目录、删除目录、获取文件信息、获取目录文件列表、获取服务使用量
*/
@Component()
export class RestfulUtil {

  private readonly apihost = 'http://v0.api.upyun.com'

  constructor(
    private readonly authUtil: AuthUtil) { }

  //上传文件，其中文件信息来自于formidable解析得到的File对象
  async uploadFile(data: any, bucket: Bucket, file: File | Image | Video | Audio | Document, uploadFile: any): Promise<any> {
    let contentMd5 = file.md5
    let save_key = '/' + bucket.directory + '/' + file.name + '.' + file.type
    let requestUrl = this.apihost + '/' + bucket.name + save_key
    let url = '/' + bucket.name + save_key
    let date: string = new Date(+new Date() + bucket.request_expire * 1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket, 'PUT', url, date, contentMd5)
    let format = bucket.image_config.format || 'raw'
    let x_gmkerl_thumb
    if (format === 'raw') {
      x_gmkerl_thumb = '/scale/100'
    } else if (format === 'webp_damage') {
      x_gmkerl_thumb = '/format/webp/strip/true'
    } else {
      x_gmkerl_thumb = '/format/webp/lossless/true/strip/true'
    }
    let height, width, frames
    await new Promise((resolve, reject) => {
      fs.createReadStream(uploadFile.path).pipe(request.put({
        url: requestUrl,
        headers: {
          'Content-Type': mime.getType(file.name),
          'Content-Length': file.size,
          'Content-MD5': contentMd5,
          Authorization,
          Date: date,
          'x-gmkerl-thumb': x_gmkerl_thumb
        }
      }, (err, res, body) => {
        if (err) {
          data.code = 402
          data.message = '文件上传失败,网络错误'
          resolve()
          return
        }
        if (res.statusCode === 200) {
          data.code = 200
          data.message = '文件上传成功'
          width = res.headers['x-upyun-width']
          height = res.headers['x-upyun-height']
          frames = res.headers['x-upyun-frames']
          resolve()
          return
        }
        if (body) {
          try {
            let { msg, code, id } = JSON.parse(body)
            data.code = code
            data.message = msg
          } catch (err) {
            data.code = 402
            data.message = '响应体解析错误'
          }
        } else {
          data.code = 402
          data.message = '响应体不存在'
        }
        resolve()
        return
      }))
    })
    if (data.code == 402) {
      return {}
    }
    return { width, height, frames }
  }


  /*创建指定空间里的指定目录，空间下唯一目录在配置中指定 
      @Param data：状态码
      @Param bucket：目录所属空间
  */
  async createDirectory(data: any, bucket: Bucket): Promise<void> {
    let requestUrl = this.apihost + '/' + bucket.name + '/' + bucket.directory
    let url = '/' + bucket.name + '/' + bucket.directory
    let date: string = new Date(+new Date() + bucket.request_expire * 1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket, 'POST', url, date, null)
    await new Promise((resolve, reject) => {
      request.post({
        url: requestUrl,
        headers: {
          Authorization,
          Date: date,
          folder: true
        }
      },
        (err, res, body) => {
          if (err) {
            data.code = 402
            data.message = '目录创建失败，网络错误'
            resolve()
            return
          }
          if (res.statusCode === 200) {
            data.code = 200
            data.message = '目录创建成功'
            resolve()
            return
          }
          if (body) {
            try {
              let { msg, code, id } = JSON.parse(body)
              data.code = code
              data.message = msg
            } catch (err) {
              data.code = 402
              data.message = '响应体解析错误'
            }
          } else {
            data.code = 402
            data.message = '响应体不存在'
          }
          resolve()
          return
        })
    })
    return
  }

  /* 删除指定空间指定文件
     @Param data:状态码
     @Param bucket：文件所属空间
     @Param file：文件对象
   */
  async deleteFile(data: any, bucket: Bucket, file: File | Image | Video | Audio | Document): Promise<void> {
    let save_key = '/' + bucket.directory + '/' + file.name + '.' + file.type
    let requestUrl = this.apihost + '/' + bucket.name + save_key
    let url = '/' + bucket.name + save_key
    let date: string = new Date(+new Date() + bucket.request_expire * 1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket, 'DELETE', url, date, '')
    await new Promise((resolve, reject) => {
      request.delete({
        url: requestUrl,
        headers: {
          Authorization,
          Date: date
        }
      }, (err, res, body) => {
        if (err) {
          data.code = 403
          data.message = '删除文件失败'
          console.log('删除文件失败')
          console.log(err)
          resolve()
          return
        }
        if (res.statusCode == 200) {
          data.code = 200
          data.message = '删除文件成功'
          console.log('删除文件成功')
          resolve()
          return
        }
        if (body) {
          try {
            let { msg, code, id } = JSON.parse(body)
            data.code = code
            data.message = msg
          } catch (err) {
            data.code = 403
            data.message = '响应体解析错误'
          }
        } else {
          data.code = 403
          data.message = '响应体不存在'
        }
        console.log('删除文件失败')
        resolve()
        return
      });
    })
    return
  }


  /* 获取指定文件的保存信息
   */
  async getFileInfo(data: any, bucket: Bucket, file: File | Image | Video | Audio | Document): Promise<any> {
    let save_key = '/' + bucket.directory + '/' + file.name + '.' + file.type
    let requestUrl = this.apihost + '/' + bucket.name + save_key
    let url = '/' + bucket.name + save_key
    let date: string = new Date(+new Date() + bucket.request_expire * 1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket, 'HEAD', url, date, '')
    let file_size, file_date, file_md5
    await new Promise((resolve, reject) => {
      request.head({
        url: requestUrl,
        headers: {
          Authorization,
          Date: date
        }
      }, (err, res, body) => {
        if (err) {
          data.code = 403
          data.message = '获取文件信息失败'
          resolve()
          return
        }
        if (res.statusCode == 200) {
          data.code = 200
          data.message = '获取文件信息成功'
          file_size = +res.headers['x-upyun-file-size']
          file_date = +res.headers['x-upyun-file-date']
          file_md5 = res.headers['content-md5']
          resolve()
          return
        }
        if (body) {
          try {
            let { msg, code, id } = JSON.parse(body)
            data.code = code
            data.message = msg
          } catch (err) {
            data.code = 403
            data.message = '响应体解析错误'
          }
        } else {
          data.code = 403
          data.message = '响应体不存在'
        }
        resolve()
        return
      });
    })
    return { file_size, file_date, file_md5 }
  }


  /* 获取指定空间下文件\目录列表
     响应头信息中指明了分页位置
     响应体为换行符、空格拼接的字符串，列分别为
     文件名/目录名  类型(N表示文件、F标志目录) 大小 最后修改时间
   */
  async getFileList(data: any, bucket: Bucket): Promise<any> {
    let save_key = '/' + bucket.directory
    let requestUrl = this.apihost + '/' + bucket.name + save_key
    let url = '/' + bucket.name + save_key
    let date: string = new Date(+new Date() + bucket.request_expire * 1000).toUTCString()
    let Authorization = await this.authUtil.getHeaderAuth(bucket, 'GET', url, date, '')
    await new Promise((resolve, reject) => {
      request.get({
        url: requestUrl,
        headers: {
          Authorization,
          Date: date
        }
      }, (err, res, body) => {
        if (err) {
          data.code = 403
          data.message = '获取文件信息失败'
          resolve()
          return
        }
        if (res.statusCode == 200) {
          data.code = 200
          data.message = '获取文件信息成功'
          data.info = body.split('\n').map((value, index, raw) => {
            let temp = value.split('\t')
            return {
              name: temp[0],
              isDirectory: (temp[1] === 'N' ? false : true),
              size: parseInt(temp[2]),
              timestamp: parseInt(temp[3])
            }
          })
          resolve()
          return
        }
        data.code = 403
        data.message = '获取文件信息失败'
        resolve()
        return
      });
    })
  }
}