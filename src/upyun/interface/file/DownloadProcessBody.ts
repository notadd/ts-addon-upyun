import { ApiModelProperty } from '@nestjs/swagger';

export class DownloadProcessBody {

    @ApiModelProperty({ description: '所属空间名', required: true })
    bucketName: string

    @ApiModelProperty({ description: '下载文件的文件名', required: true })
    name: string

    @ApiModelProperty({ description: '文件类型', required: true })
    type: string
}