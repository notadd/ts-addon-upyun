import { Repository } from 'typeorm';
import { Bucket } from '../model/Bucket.entity';
import { File } from '../model/File.entity';
import { Image } from '../model/Image.entity';
import { FileService } from '../service/FileService';
import { AuthUtil } from '../util/AuthUtil';
import { KindUtil } from '../util/KindUtil';
import { RestfulUtil } from '../util/RestfulUtil';
export declare class FileController {
    private readonly authUtil;
    private readonly kindUtil;
    private readonly restfulUtil;
    private readonly fileService;
    private readonly fileRepository;
    private readonly imageRepository;
    private readonly bucketRepository;
    constructor(authUtil: AuthUtil, kindUtil: KindUtil, restfulUtil: RestfulUtil, fileService: FileService, fileRepository: Repository<File>, imageRepository: Repository<Image>, bucketRepository: Repository<Bucket>);
    asyncNotify(body: any, req: any, headers: any, res: any): Promise<any>;
}
