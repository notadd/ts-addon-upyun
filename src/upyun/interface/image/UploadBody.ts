import { ApiModelProperty } from '@nestjs/swagger';

export class UploadBody{

    @ApiModelProperty({description:'当前操作的是否是公有空间',required:true})
    isPublic:boolean

    @ApiModelProperty({description:'上传文件的md5值',required:true})
    contentMd5:string

    @ApiModelProperty({description:'文件访问密钥',required:false})
    contentSecret:string

    @ApiModelProperty({description:'文件名',required:true})
    contentName:string
}