import { ImagePreProcessInfo } from '../interface/file/ImageProcessInfo';
import { Audio } from '../model/Audio.entity';
import { Bucket } from '../model/Bucket.entity';
import { Document } from '../model/Document.entity';
import { File } from '../model/File.entity';
import { Image } from '../model/Image.entity';
import { Video } from '../model/Video.entity';
import { AuthUtil } from '../util/AuthUtil';
import { ProcessStringUtil } from './ProcessStringUtil';
import { PromiseUtil } from './PromiseUtil';
export declare class RestfulUtil {
    private readonly authUtil;
    private readonly promiseUtil;
    private readonly processStringUtil;
    private readonly apihost;
    constructor(authUtil: AuthUtil, promiseUtil: PromiseUtil, processStringUtil: ProcessStringUtil);
    uploadFile(bucket: Bucket, file: File | Image | Video | Audio | Document, uploadFile: any, imagePreProcessInfo: ImagePreProcessInfo): Promise<{
        width: number;
        height: number;
        frames: number;
    }>;
    createDirectory(bucket: Bucket): Promise<void>;
    deleteFile(bucket: Bucket, file: File | Image | Video | Audio | Document): Promise<void>;
    getFileInfo(bucket: Bucket, file: File | Image | Video | Audio | Document): Promise<{
        file_size: number;
        file_date: any;
        file_md5: string;
    }>;
    getFileList(bucket: Bucket): Promise<any>;
}
