import { ImagePostProcessInfo, ImagePreProcessInfo } from '../interface/file/ImageProcessInfo';
import { HttpException, Component, Inject } from '@nestjs/common';
import { ProcessStringUtil } from '../util/ProcessStringUtil';
import { Repository, Connection } from 'typeorm';
import { Document } from '../model/Document';
import { AuthUtil } from '../util/AuthUtil';
import { KindUtil } from '../util/KindUtil';
import { FileUtil } from '../util/FileUtil';
import { Bucket } from '../model/Bucket';
import { Video } from '../model/Video';
import { Audio } from '../model/Audio';
import { Image } from '../model/Image';
import { File } from '../model/File';
import * as path from 'path';
import { RestfulUtil } from '../util/RestfulUtil';


class StoreComponent {

    constructor(
        @Inject(KindUtil) private readonly kindUtil: KindUtil,
        @Inject(FileUtil) private readonly fileUtil: FileUtil,
        @Inject(AuthUtil) private readonly authUtil: AuthUtil,
        @Inject(RestfulUtil) private readonly resufulUtil: RestfulUtil,
        @Inject(ProcessStringUtil) private readonly processStringUtil: ProcessStringUtil,
        @Inject('UpyunModule.ImageRepository') private readonly imageRepository: Repository<Image>,
        @Inject('UpyunModule.BucketRepository') private readonly bucketRepository: Repository<Bucket>
    ) {}

    async delete(bucketName: string, name: string, type: string): Promise<void> {
        //验证参数
        if (!bucketName || !name || !type) {
            throw new HttpException('缺少参数', 400)
        }
        let bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName })
        if (!bucket) {
            throw new HttpException('指定空间' + bucketName + '不存在', 401)
        }
        //根据文件种类，查找、删除数据库
        let file:Image|Audio|Video|Document|File
        let kind = this.kindUtil.getKind(type)
        if (kind === 'image') {
            file = await this.imageRepository.findOne({ name, bucketId: bucket.id })
            if (!file) {
                throw new HttpException('文件' + name + '不存在于数据库中', 404)
            }
            await this.imageRepository.deleteById(file.id)
        } else {
            //其他类型暂不支持
        }
        await this.resufulUtil.deleteFile(bucket,file)
        return 
    }

    async upload(bucketName: string, rawName: string, base64: string): Promise<{ bucketName: string, name: string, type: string }> {
        let tempPath: string = path.resolve(__dirname, '../', 'store', 'temp', (+new Date()) + '' + rawName)
        if (!bucketName || !rawName || !base64) {
            throw new HttpException('缺少参数', 400)
        }
        let bucket: Bucket = await this.bucketRepository.createQueryBuilder('bucket')
            .leftJoinAndSelect('bucket.image_config', 'image_config')
            .where('bucket.name = :name', { name: bucketName })
            .getOne()
        if (!bucket) {
            throw new HttpException('指定空间' + bucketName + '不存在', 401)
        }
        await this.fileUtil.write(tempPath, Buffer.from(base64, 'base64'))
        let metadata: ImageMetadata
        let type: string = rawName.substring(rawName.lastIndexOf('.') + 1)
        //根据文件种类
        let kind: string = this.kindUtil.getKind(type)
        try {
            if (kind === 'image') {
                let imagePostProcessInfo: ImagePostProcessInfo
                let format = bucket.image_config.format || 'raw'
                //根据不同的图片保存类型，处理并且存储图片，返回处理后元数据
                if (format === 'raw') {
                    imagePostProcessInfo = { strip: true, watermark: false }
                } else if (format === 'webp_damage') {
                    imagePostProcessInfo = { format: 'webp', strip: true, watermark: false }
                } else if (format === 'webp_undamage') {
                    imagePostProcessInfo = { format: 'webp', lossless: true, strip: true, watermark: false }
                }
                metadata = await this.imageProcessUtil.processAndStore(tempPath, bucket, imagePostProcessInfo)
                let image: Image = new Image()
                image.bucket = bucket
                image.raw_name = rawName
                image.name = metadata.name
                image.type = metadata.format
                image.width = metadata.width
                image.height = metadata.height
                image.size = metadata.size
                let isExist: Image = await this.imageRepository.findOne({ name: metadata.name, bucketId: bucket.id })
                //只有指定路径图片不存在时才会保存
                if (!isExist) {
                    try {
                        await this.imageRepository.save(image)
                    } catch (err) {
                        //保存图片出现错误，要删除存储图片
                        await this.fileUtil.delete(path.resolve(__dirname, '../', 'store', bucket.name, image.name + '.' + image.type))
                        throw new HttpException('上传图片保存失败' + err.toString(), 410)
                    }
                }
            } else {
                //其他类型暂不支持
            }
        } catch (err) {
            throw err
        } finally {
            //如果中间过程抛出了异常，要保证删除临时图片
            await this.fileUtil.deleteIfExist(tempPath)
        }
        return { bucketName, name: metadata.name, type: metadata.format }
    }

    async getUrl(req: any, bucketName: string, name: string, type: string, imagePostProcessInfo: ImagePostProcessInfo): Promise<string> {
        //验证参数
        if (!bucketName || !name || !type) {
            throw new HttpException('缺少参数', 400)
        }
        let bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName })
        if (!bucket) {
            throw new HttpException('指定空间' + bucketName + '不存在', 401)
        }
        let url: string = req.protocol + '://' + req.get('host') + '/local/file/visit'
        //根据文件种类，查找、删除数据库
        let kind = this.kindUtil.getKind(type)
        if (kind === 'image') {
            let image: Image = await this.imageRepository.findOne({ name, bucketId: bucket.id })
            if (!image) {
                throw new HttpException('指定图片' + name + '.' + type + '不存在', 404)
            }
            //所有文件调用统一的拼接Url方法 
            url += '/' + bucketName + '/' + name + '.' + type
            //存储图片处理信息时
            if (imagePostProcessInfo) {
                //拼接图片处理的查询字符串
                url += '?imagePostProcessString=' + JSON.stringify(imagePostProcessInfo)
                //私有空间要拼接token，token使用它之前的完整路径计算
                if (bucket.public_or_private === 'private') {
                    url += '&token=' + this.tokenUtil.getToken(url, bucket)
                }
            } else {
                if (bucket.public_or_private === 'private') {
                    url += '?token=' + this.tokenUtil.getToken(url, bucket)
                }
            }
        } else {
            //其他类型暂不支持
        }
        return url
    }
}

export const StoreComponentProvider = {
    provide: 'StoreComponentToken',
    useFactory: (kindUtil: KindUtil, fileUtil: FileUtil, tokenUtil: TokenUtil, imageProcessUtil: ImageProcessUtil, imageRepository: Repository<Image>, bucketRepository: Repository<Bucket>) => {
        return new StoreComponent(kindUtil, fileUtil, tokenUtil, imageProcessUtil, imageRepository, bucketRepository)
    },
    inject: [KindUtil, FileUtil, TokenUtil, ImageProcessUtil, 'LocalModule.ImageRepository', 'LocalModule.BucketRepository']

}