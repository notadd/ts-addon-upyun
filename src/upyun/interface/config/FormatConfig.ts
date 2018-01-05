import { ApiModelProperty } from '@nestjs/swagger';

export class FormatConfig{

    @ApiModelProperty({description:'预处理保存格式，只能为raw、webp_damage、webp_undamage',required:true})
    format:string
}