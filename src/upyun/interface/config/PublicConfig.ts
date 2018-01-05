
import { ApiModelProperty } from '@nestjs/swagger';

export class PublicConfig {

  @ApiModelProperty({description:'空间名称',required:true})
  bucket: string;

  @ApiModelProperty({description:'操作员',required:true})
  operator: string;

  @ApiModelProperty({description:'密码',required:true})
  password: string;

  @ApiModelProperty({description:'请求超时',required:true})
  request_expire: number;

  @ApiModelProperty({description:'访问图片的CDN域名',required:true})
  base_url: string;

  @ApiModelProperty({description:'目录名称',required:true})
  directory: string;


}
