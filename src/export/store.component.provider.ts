import { ImagePostProcessInfo, ImagePreProcessInfo } from "../interface/file/image.process.info";
import { ProcessStringUtil } from "../util/process.string.util";
import { HttpException, Inject } from "@nestjs/common";
import { FileService } from "../service/file.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Document } from "../model/document.entity";
import { RestfulUtil } from "../util/restful.util";
import { Bucket } from "../model/bucket.entity";
import { Image } from "../model/image.entity";
import { Video } from "../model/video.entity";
import { Audio } from "../model/audio.entity";
import { AuthUtil } from "../util/auth.util";
import { FileUtil } from "../util/file.util";
import { KindUtil } from "../util/kind.util";
import { File } from "../model/file.entity";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import * as os from "os";

export class StoreComponent {

    constructor(
        private readonly kindUtil: KindUtil,
        private readonly fileUtil: FileUtil,
        private readonly authUtil: AuthUtil,
        private readonly resufulUtil: RestfulUtil,
        private readonly fileService: FileService,
        private readonly processStringUtil: ProcessStringUtil,
        private readonly imageRepository: Repository<Image>,
        private readonly bucketRepository: Repository<Bucket>
    ) { }

    async delete(bucketName: string, name: string, type: string): Promise<void> {
        // 验证参数
        if (!bucketName || !name || !type) {
            throw new HttpException("缺少参数", 400);
        }
        const bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName });
        if (!bucket) {
            throw new HttpException(`指定空间name=${bucketName}不存在`, 401);
        }
        // 根据文件种类，查找、删除数据库
        let file: Image | Audio | Video | Document | File;
        const kind = this.kindUtil.getKind(type);
        if (kind === "image") {
            file = await this.imageRepository.findOne({ name, bucketId: bucket.id });
            if (!file) {
                throw new HttpException(`文件name=${name}不存在于数据库中`, 404);
            }
            await this.imageRepository.remove(file as Image);
        } else {
            // 其他类型暂不支持
        }
        await this.resufulUtil.deleteFile(bucket, file);
        return;
    }

    async upload(
        bucketName: string,
        rawName: string,
        base64: string,
        imagePreProcessInfo: ImagePreProcessInfo | undefined,
    ): Promise<{ bucketName: string, name: string, type: string }> {

        if (!bucketName || !rawName || !base64) {
            throw new HttpException("缺少参数", 400);
        }

        const bucket: Bucket = await this.bucketRepository.createQueryBuilder("bucket")
            .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
            .where({ name: bucketName })
            .getOne();
        if (!bucket) {
            throw new HttpException(`指定空间name=${bucketName}不存在`, 401);
        }
        const buffer: Buffer = Buffer.from(base64, "base64");
        const md5 = crypto.createHash("md5").update(buffer).digest("hex");
        const name = `${md5}_${+new Date()}`;
        const tempPath = `${os.tmpdir}/${rawName}`;
        await this.fileUtil.write(tempPath, buffer);
        let file: Image | Audio | Video | Document | File;
        const uploadFile = { path: tempPath };
        let type: string = rawName.substring(rawName.lastIndexOf(".") + 1);
        const kind: string = this.kindUtil.getKind(type);
        try {
            if (kind === "image") {
                if (bucket.imageConfig.format === "webp_damage" || bucket.imageConfig.format === "webp_undamage") {
                    type = "webp";
                }
                file = this.imageRepository.create({
                    bucket,
                    rawName,
                    name,
                    type,
                    md5,
                    status: "post"
                });
                const { width, height, frames } = await this.resufulUtil.uploadFile(bucket, file, uploadFile, imagePreProcessInfo);
                const { fileSize, fileMd5 } = await this.resufulUtil.getFileInfo(bucket, file);
                file = this.imageRepository.create({
                    bucket,
                    rawName,
                    name,
                    type,
                    width,
                    height,
                    frames,
                    size: fileSize,
                    md5: fileMd5,
                    status: "post"
                });
                await this.imageRepository.save(file);
            } else {
                // 其他类型暂不支持
            }
        } catch (err) {
            throw err;
        } finally {
            // 如果中间过程抛出了异常，要保证删除临时图片
            await this.fileUtil.deleteIfExist(tempPath);
        }

        return { bucketName, name, type };
    }

    async getUrl(req: any, bucketName: string, name: string, type: string, imagePostProcessInfo: ImagePostProcessInfo | undefined): Promise<string> {
        // 验证参数
        if (!bucketName || !name || !type) {
            throw new HttpException("缺少参数", 400);
        }
        const bucket: Bucket = await this.bucketRepository.createQueryBuilder("bucket")
            .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
            .where({ name: bucketName })
            .getOne();
        if (!bucket) {
            throw new HttpException(`指定空间name=${bucketName}不存在`, 401);
        }
        let url: string;
        // 根据文件种类，查找、删除数据库
        let file: Image | Audio | Video | Document | File;
        const kind = this.kindUtil.getKind(type);
        if (kind === "image") {
            file = await this.imageRepository.findOne({ name, bucketId: bucket.id });
            if (!file) {
                throw new HttpException(`指定图片${name}.${type}不存在`, 404);
            }
        } else {
            // 其他类型暂不支持
        }
        url = await this.fileService.makeUrl(bucket, file, { imagePostProcessInfo }, kind);
        return url;
    }
}

export const StoreComponentToken = "StoreComponentToken";

export const StoreComponentProvider = {
    provide: StoreComponentToken,
    useFactory: (
        kindUtil: KindUtil,
        fileUtil: FileUtil,
        authUtil: AuthUtil,
        restfulUtil: RestfulUtil,
        fileService: FileService,
        processStringUtil: ProcessStringUtil,
        imageRepository: Repository<Image>,
        bucketRepository: Repository<Bucket>,
    ) => {
        return new StoreComponent(
            kindUtil,
            fileUtil,
            authUtil,
            restfulUtil,
            fileService,
            processStringUtil,
            imageRepository,
            bucketRepository,
        );
    },
    inject: [
        KindUtil,
        FileUtil,
        AuthUtil,
        RestfulUtil,
        FileService,
        ProcessStringUtil,
        getRepositoryToken(Image),
        getRepositoryToken(Bucket),
    ],
};
