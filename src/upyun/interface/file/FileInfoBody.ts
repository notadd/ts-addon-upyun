import { ApiModelProperty } from '@nestjs/swagger';

export class FileInfoBody {

    @ApiModelProperty({ description: '所属空间名', required: true })
    bucketName: string

    @ApiModelProperty({ description: '文件名', required: true })
    name: string

    @ApiModelProperty({ description: '文件类型', required: true })
    type: string
}