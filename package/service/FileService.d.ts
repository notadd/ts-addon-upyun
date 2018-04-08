import { Repository } from 'typeorm';
import { UploadProcessBody } from '../interface/file/UploadProcessBody';
import { Audio } from '../model/Audio.entity';
import { Bucket } from '../model/Bucket.entity';
import { Document } from '../model/Document.entity';
import { File } from '../model/File.entity';
import { Image } from '../model/Image.entity';
import { Video } from '../model/Video.entity';
import { AuthUtil } from '../util/AuthUtil';
import { KindUtil } from '../util/KindUtil';
import { ProcessStringUtil } from '../util/ProcessStringUtil';
import { RestfulUtil } from '../util/RestfulUtil';
export declare class FileService {
    private readonly authUtil;
    private readonly kindUtil;
    private readonly restfulUtil;
    private readonly processStringUtil;
    private readonly fileRepository;
    private readonly imageRepository;
    private readonly audioRepository;
    private readonly videoRepository;
    private readonly bucketRepository;
    constructor(authUtil: AuthUtil, kindUtil: KindUtil, restfulUtil: RestfulUtil, processStringUtil: ProcessStringUtil, fileRepository: Repository<File>, imageRepository: Repository<Image>, audioRepository: Repository<Audio>, videoRepository: Repository<Video>, bucketRepository: Repository<Bucket>);
    makePolicy(data: any, policy: any, bucket: Bucket, body: UploadProcessBody, file: File | Image | Video | Audio | Document): Promise<void>;
    preSaveFile(bucket: Bucket, body: UploadProcessBody): Promise<File | Image | Video | Audio | Document>;
    postSaveTask(bucket: Bucket, name: string, body: any, kind: string): Promise<void>;
    makeUrl(bucket: Bucket, file: File | Image | Video | Audio | Document, body: any, kind: string): Promise<string>;
    getAll(data: any, bucket: Bucket): Promise<void>;
}
