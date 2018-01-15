import { ApiModelProperty } from '@nestjs/swagger';

export class VideoFormatConfig{
    @ApiModelProperty({description:'视频预处理保存格式，只能为raw、vp9、h264、h265',required:true})
    format:string
    @ApiModelProperty({description:'视频预处理保存分辨率，只能为raw、1080p、720p、480p',required:true})
    resolution:string
}