import { ApiModelProperty } from '@nestjs/swagger';

export class DownloadProcessBody {
    bucketName: string
    name: string
    type: string
}