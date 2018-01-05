import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteQuery{

    @ApiModelProperty({description:'被删除图片的存储路径',required:true})
    save_key:string

    @ApiModelProperty({description:'是否是公有空间图片',required:true})
    isPublic:boolean

}