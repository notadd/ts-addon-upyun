import { Query, Resolver, ResolveProperty, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,SelectQueryBuilder} from 'typeorm';
import { ConfigService } from '../../service/ConfigService';
import { FileService } from '../../service/FileService';
import { RestfulUtil } from '../../util/RestfulUtil';
import { KindUtil } from '../../util/KindUtil'
import { AuthUtil } from '../../util/AuthUtil'
import { Document } from '../../model/Document'
import { Bucket } from '../../model/Bucket';
import { Audio } from '../../model/Audio'
import { Video } from '../../model/Video'
import { Image } from '../../model/Image';
import { File } from '../../model/File'
import { DownloadProcessBody } from '../../interface/file/DownloadProcessBody'
import { UploadProcessBody } from '../../interface/file/UploadProcessBody'
import { FileBody } from '../../interface/file/FileBody'
import { FilesBody } from '../../interface/file/FilesBody'
import { DeleteFileBody } from '../../interface/file/DeleteFileBody'
import { FileInfoBody } from '../../interface/file/FileInfoBody'
import { FileListBody } from '../../interface/file/FileListBody'
import * as  formidable from  'formidable'
import * as  path       from  'path'

/*文件控制器，包含了文件下载预处理、上传预处理、异步回调通知、获取单个文件url、获取多个文件信息以及url、删除文件、从云存储获取单个文件信息、获取指定空间下文件列表等接口
  所有文件接口只接受json类型请求体，post请求方法
*/

@Resolver('File')
export class FileResolver{

  constructor(
    private readonly authUtil: AuthUtil,
    private readonly kindUtil: KindUtil,
    private readonly restfulUtil: RestfulUtil,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    }


}    
