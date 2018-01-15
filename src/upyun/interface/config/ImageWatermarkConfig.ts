import { ApiModelProperty } from '@nestjs/swagger';

export class ImageWatermarkConfig{

    @ApiModelProperty({description:'水印图片，暂时使用string类型',required:true})
    file:string

    @ApiModelProperty({description:'水印图片位置，使用九宫格位置表示',required:true})
    gravity:string

    @ApiModelProperty({description:'横轴偏移',required:true})
    x:number

    @ApiModelProperty({description:'纵轴偏移',required:true})
    y:number

    @ApiModelProperty({description:'透明度，1-100',required:true})
    opacity:number

    @ApiModelProperty({description:'水印图片与目标图片短边自适应比例',required:true})
    ws:number
}