import { ApiModelProperty } from '@nestjs/swagger';

export class BucketConfig {
  
  @ApiModelProperty({description:'是否是公有空间',required:true})
  isPublic:boolean|string;


  @ApiModelProperty({description:'空间名称',required:true})
  name: string;

  @ApiModelProperty({description:'操作员',required:true})
  operator: string;

  @ApiModelProperty({description:'密码',required:true})
  password: string;

  @ApiModelProperty({description:'请求超时',required:true})
  request_expire: number|string;

  @ApiModelProperty({description:'访问图片的CDN域名',required:true})
  base_url: string;
  
  @ApiModelProperty({description:'token密钥',required:false})
  token_secret_key?: string;

  @ApiModelProperty({description:'token超时',required:false})
  token_expire?:number|string
}
