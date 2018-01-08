import { ApiModelProperty } from '@nestjs/swagger';

export class ImagesBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'目录名数组，由顶层目录到底层目录',required:true})
    directorys:string[]

    @ApiModelProperty({description:'分页页数',required:true})
    page:number

    @ApiModelProperty({description:'每页页数',required:true})
    pageSize:number
}