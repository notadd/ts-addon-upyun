import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteFileBody {
    bucketName: string
    name: string
    type: string
}