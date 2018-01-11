import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteFileBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'被删除的文件名',required:true})
    name:string

    @ApiModelProperty({description:'被删除文件类型',required:true})
    type:string
}