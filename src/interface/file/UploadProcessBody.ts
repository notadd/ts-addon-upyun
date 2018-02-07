import { ImagePreProcessInfo } from './ImageProcessInfo'


export class UploadProcessBody {
    bucketName: string
    md5: string
    contentName: string
    contentSecret?: string
    tags?: string[]
    imagePreProcessInfo?: ImagePreProcessInfo
}