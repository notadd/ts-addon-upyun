import { ApiModelProperty } from '@nestjs/swagger';

export class EnableWatermarkConfig{

    @ApiModelProperty({description:'是否启用水印，使用表单请求时为字符串，使用json请求时为boolean',required:true})
    enable:string|boolean
}