import { ApiModelProperty ,ApiModelPropertyOptional } from '@nestjs/swagger';
import { ImagePostProcessInfo } from './ImageProcessInfo'


export class FileBody{
    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string
    @ApiModelProperty({description:'文件名',required:true})
    name:string
    @ApiModelProperty({description:'文件类型',required:true})
    type:string
    @ApiModelProperty({description:'图片后处理处理信息，包含了包含了所有处理功能',required:true})
    imagePostProcessInfo:ImagePostProcessInfo
}




