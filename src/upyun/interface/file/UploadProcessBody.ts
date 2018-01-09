import { ApiModelProperty } from '@nestjs/swagger';

export class UploadProcessBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'上传图片的md5值',required:true})
    md5:string


    @ApiModelProperty({description:'文件名',required:true})
    contentName:string

    @ApiModelProperty({description:'文件访问密钥',required:false})
    contentSecret?:string
}