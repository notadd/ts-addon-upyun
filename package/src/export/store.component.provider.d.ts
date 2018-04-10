import { Repository } from "typeorm";
import { ImagePostProcessInfo, ImagePreProcessInfo } from "../interface/file/image.process.info";
import { Bucket } from "../model/bucket.entity";
import { Image } from "../model/image.entity";
import { FileService } from "../service/file.service";
import { AuthUtil } from "../util/auth.util";
import { FileUtil } from "../util/file.util";
import { KindUtil } from "../util/kind.util";
import { ProcessStringUtil } from "../util/process.string.util";
import { RestfulUtil } from "../util/restful.util";
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
