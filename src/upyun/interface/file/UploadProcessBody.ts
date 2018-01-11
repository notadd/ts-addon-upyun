import { ApiModelProperty } from '@nestjs/swagger';
import { ImagePreProcessInfo } from './ImageProcessInfo'


export class UploadProcessBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'上传文件的md5',required:true})
    md5:string

    @ApiModelProperty({description:'文件名',required:true})
    contentName:string

    @ApiModelProperty({description:'文件访问密钥',required:false})
    contentSecret?:string

    @ApiModelProperty({description:'文件所属标签数组',required:false})
    tags?:string[]

    @ApiModelProperty({description:'文件预处理信息，包含了缩放、裁剪、旋转、水印四种',required:false})
    imagePreProcessInfo:ImagePreProcessInfo
}