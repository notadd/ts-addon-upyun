/// <reference types="node" />
/// <reference types="express" />
import { Request } from 'express';
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';
import { Data } from '../../interface/Data';
import { AllBody } from '../../interface/file/AllBody';
import { AllData } from '../../interface/file/AllData';
import { DownloadProcessData } from '../../interface/file/DownloadProcessData';
import { FileLocationBody } from '../../interface/file/FileLocationBody';
import { OneBody } from '../../interface/file/OneBody';
import { OneData } from '../../interface/file/OneData';
import { UploadProcessBody } from '../../interface/file/UploadProcessBody';
import { UploadProcessData } from '../../interface/file/UploadProcessData';
import { Bucket } from '../../model/Bucket.entity';
import { File } from '../../model/File.entity';
import { Image } from '../../model/Image.entity';
import { ConfigService } from '../../service/ConfigService';
import { FileService } from '../../service/FileService';
import { AuthUtil } from '../../util/AuthUtil';
import { KindUtil } from '../../util/KindUtil';
import { RestfulUtil } from '../../util/RestfulUtil';
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
