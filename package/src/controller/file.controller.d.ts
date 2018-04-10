import { Repository } from "typeorm";
import { Bucket } from "../model/bucket.entity";
import { File } from "../model/file.entity";
import { Image } from "../model/image.entity";
import { FileService } from "../service/file.service";
import { AuthUtil } from "../util/auth.util";
import { KindUtil } from "../util/kind.util";
import { RestfulUtil } from "../util/restful.util";
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
