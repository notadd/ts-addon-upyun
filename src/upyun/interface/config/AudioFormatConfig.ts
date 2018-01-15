import { ApiModelProperty } from '@nestjs/swagger';

export class AudioFormatConfig{
    @ApiModelProperty({description:'音频预处理保存格式，只能为raw、mp3、aac',required:true})
    format:string
}