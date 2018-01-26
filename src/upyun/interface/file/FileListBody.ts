import { ApiModelProperty } from '@nestjs/swagger';

export class FileListBody {

    @ApiModelProperty({ description: '所属空间名', required: true })
    bucket_name: string
}