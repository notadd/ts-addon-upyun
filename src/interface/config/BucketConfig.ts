
export interface BucketConfig {
  isPublic: boolean | string;
  name: string;
  operator: string;
  password: string;
  //空间在云存储上的唯一目录，所有文件存储在它下面
  directory: string;
  request_expire: number | string;
  base_url: string;
  token_secret_key?: string;
  token_expire?: number | string
}
