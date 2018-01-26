import { ApiModelProperty } from '@nestjs/swagger';

export class ImageFormatConfig {
    @ApiModelProperty({ description: '图片预处理保存格式，只能为raw、webp_damage、webp_undamage', required: true })
    format: string
}