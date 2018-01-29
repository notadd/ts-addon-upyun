import { ApiModelProperty } from '@nestjs/swagger';

export class FilesBody {

    @ApiModelProperty({ description: '所属空间名', required: true })
    bucketName: string
}