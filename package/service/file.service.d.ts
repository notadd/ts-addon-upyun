import { Repository } from "typeorm";
import { UploadProcessBody } from "../interface/file/upload.process.body";
import { Audio } from "../model/audio.entity";
import { Bucket } from "../model/bucket.entity";
import { Document } from "../model/document.entity";
import { File } from "../model/file.entity";
import { Image } from "../model/image.entity";
import { Video } from "../model/video.entity";
import { AuthUtil } from "../util/auth.util";
import { KindUtil } from "../util/kind.util";
import { ProcessStringUtil } from "../util/process.string.util";
import { RestfulUtil } from "../util/restful.util";
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
    getAll(data: any, bucketName: string): Promise<void>;
}
