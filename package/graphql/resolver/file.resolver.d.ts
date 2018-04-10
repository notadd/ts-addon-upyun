/// <reference types="node" />
/// <reference types="express" />
import { Request } from 'express';
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';
import { Data } from '../../interface/data';
import { AllBody } from '../../interface/file/all.body';
import { AllData } from '../../interface/file/all.data';
import { DownloadProcessData } from '../../interface/file/download.process.data';
import { FileLocationBody } from '../../interface/file/file.location.body';
import { OneBody } from '../../interface/file/one.body';
import { OneData } from '../../interface/file/one.data';
import { UploadProcessBody } from '../../interface/file/upload.process.body';
import { UploadProcessData } from '../../interface/file/upload.process.data';
import { Bucket } from '../../model/bucket.entity';
import { File } from '../../model/file.entity';
import { Image } from '../../model/image.entity';
import { ConfigService } from '../../service/config.service';
import { FileService } from '../../service/file.service';
import { AuthUtil } from '../../util/auth.util';
import { KindUtil } from '../../util/kind.util';
import { RestfulUtil } from '../../util/restful.util';
export declare class FileResolver {
    private readonly authUtil;
    private readonly kindUtil;
    private readonly restfulUtil;
    private readonly fileService;
    private readonly configService;
    private readonly fileRepository;
    private readonly imageRepository;
    private readonly bucketRepository;
    constructor(authUtil: AuthUtil, kindUtil: KindUtil, restfulUtil: RestfulUtil, fileService: FileService, configService: ConfigService, fileRepository: Repository<File>, imageRepository: Repository<Image>, bucketRepository: Repository<Bucket>);
    downloadProcess(req: IncomingMessage, body: FileLocationBody): Promise<DownloadProcessData>;
    uploadProcess(req: Request, body: UploadProcessBody): Promise<UploadProcessData>;
    getFile(req: IncomingMessage, body: OneBody): Promise<OneData>;
    files(req: IncomingMessage, body: AllBody): Promise<AllData>;
    deleteFile(req: IncomingMessage, body: FileLocationBody): Promise<Data>;
}
