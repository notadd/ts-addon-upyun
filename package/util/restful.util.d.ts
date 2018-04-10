import { ImagePreProcessInfo } from '../interface/file/image.process.info';
import { Audio } from '../model/audio.entity';
import { Bucket } from '../model/bucket.entity';
import { Document } from '../model/document.entity';
import { File } from '../model/file.entity';
import { Image } from '../model/image.entity';
import { Video } from '../model/video.entity';
import { AuthUtil } from '../util/auth.util';
import { ProcessStringUtil } from './process.string.util';
import { PromiseUtil } from './promise.util';
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
