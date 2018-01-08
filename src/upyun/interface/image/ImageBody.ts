import { ApiModelProperty ,ApiModelPropertyOptional } from '@nestjs/swagger';

class ResizeData{
    @ApiModelProperty({description:'等比缩放比例',required:false})
    scale:number
    @ApiModelProperty({description:'宽度缩放比例',required:false})
    wscale:number
    @ApiModelProperty({description:'高度缩放比例',required:false})
    hscale:number
    @ApiModelProperty({description:'宽度',required:false})
    width:number
    @ApiModelProperty({description:'高度',required:false})
    height:number
    @ApiModelProperty({description:'像素',required:false})
    pixel:number
}

class Resize{
    
        @ApiModelProperty({description:'缩放模式',required:true})
        mode:string
    
        @ApiModelProperty({description:'缩放数据',required:true})
        data:ResizeData
}

class Tailor{
    @ApiModelProperty({description:'是否在缩放之前裁剪',required:false})
    isBefore:boolean
    @ApiModelProperty({description:'裁剪图片宽度',required:true})
    width:number
    @ApiModelProperty({description:'裁剪图片高度',required:true})
    height:number
    @ApiModelProperty({description:'裁剪图片横轴偏移',required:true})
    x:number
    @ApiModelProperty({description:'裁剪图片纵轴偏移',required:true})
    y:number
    @ApiModelProperty({description:'裁剪重心',required:true})
    gravity:string
}

class Blur{
    @ApiModelProperty({description:'模糊半径',required:true})
    redius:number
    @ApiModelProperty({description:'模糊标准差',required:true})
    sigma:number
}



export class ImageBody{

    @ApiModelProperty({description:'所属空间名',required:true})
    bucket_name:string

    @ApiModelProperty({description:'图片所属的目录名数组，有顶层目录到底层目录',required:true})
    directorys:string[]

    @ApiModelProperty({description:'图片的md5值',required:true})
    md5:string

    @ApiModelProperty({description:'缩放参数',required:false})
    resize:Resize

    @ApiModelProperty({description:'裁剪参数',required:false})
    tailor:Tailor

    @ApiModelProperty({description:'圆角参数',required:false})
    roundrect:number

    @ApiModelProperty({description:'水印参数',required:false})
    watermark:boolean

    @ApiModelProperty({description:'旋转参数',required:false})
    rotate:number

    @ApiModelProperty({description:'高斯模糊参数',required:false})
    blur:Blur

    @ApiModelProperty({description:'锐化参数',required:false})
    sharpen:boolean

    @ApiModelProperty({description:'格式参数',required:false})
    format:string

    @ApiModelProperty({description:'图片质量参数',required:false})
    quality:number

    @ApiModelProperty({description:'渐进显示参数',required:false})
    progressive:boolean
    
    @ApiModelProperty({description:'去除所有元信息',required:false})
    strip:boolean

}




