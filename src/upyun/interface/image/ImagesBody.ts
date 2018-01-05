import { ApiModelProperty } from '@nestjs/swagger';

export class ImagesBody{

    @ApiModelProperty({description:'是否请求公有空间图片',required:true})
    isPublic:boolean

    @ApiModelProperty({description:'分页页数',required:true})
    page:number

    @ApiModelProperty({description:'每页页数',required:true})
    pageSize:number
}