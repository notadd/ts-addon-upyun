import { Repository } from 'typeorm';
import { ImagePostProcessInfo, ImagePreProcessInfo } from '../interface/file/ImageProcessInfo';
import { Bucket } from '../model/Bucket.entity';
import { Image } from '../model/Image.entity';
import { FileService } from '../service/FileService';
import { AuthUtil } from '../util/AuthUtil';
import { FileUtil } from '../util/FileUtil';
import { KindUtil } from '../util/KindUtil';
import { ProcessStringUtil } from '../util/ProcessStringUtil';
import { RestfulUtil } from '../util/RestfulUtil';
export declare class StoreComponent {
    private readonly kindUtil;
    private readonly fileUtil;
    private readonly authUtil;
    private readonly resufulUtil;
    private readonly fileService;
    private readonly processStringUtil;
    private readonly imageRepository;
    private readonly bucketRepository;
    constructor(kindUtil: KindUtil, fileUtil: FileUtil, authUtil: AuthUtil, resufulUtil: RestfulUtil, fileService: FileService, processStringUtil: ProcessStringUtil, imageRepository: Repository<Image>, bucketRepository: Repository<Bucket>);
    delete(bucketName: string, name: string, type: string): Promise<void>;
    upload(bucketName: string, rawName: string, base64: string, imagePreProcessInfo: ImagePreProcessInfo): Promise<{
        bucketName: string;
        name: string;
        type: string;
    }>;
    getUrl(req: any, bucketName: string, name: string, type: string, imagePostProcessInfo: ImagePostProcessInfo): Promise<string>;
}
export declare const StoreComponentProvider: {
    provide: string;
    useFactory: (kindUtil: KindUtil, fileUtil: FileUtil, authUtil: AuthUtil, restfulUtil: RestfulUtil, fileService: FileService, processStringUtil: ProcessStringUtil, imageRepository: Repository<Image>, bucketRepository: Repository<Bucket>) => StoreComponent;
    inject: (string | typeof AuthUtil | typeof KindUtil | typeof ProcessStringUtil | typeof RestfulUtil | typeof FileService | typeof FileUtil)[];
};
