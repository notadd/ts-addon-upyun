import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteQuery{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'被删除图片所属的目录名数组，有顶层目录到底层目录',required:true})
    directorys:string[]

    @ApiModelProperty({description:'被删除图片的md5值',required:true})
    md5:string
}