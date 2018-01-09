import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteFileBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'被删除图片的md5值',required:true})
    md5:string

    @ApiModelProperty({description:'被删除图片类型',required:true})
    type:string
}