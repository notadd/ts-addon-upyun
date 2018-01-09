import { ApiModelProperty } from '@nestjs/swagger';

export class DownloadProcessBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'下载文件的md5值',required:true})
    md5:string

    @ApiModelProperty({description:'文件扩展名，不要.',required:true})
    type:string
}