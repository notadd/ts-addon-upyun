"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_string_util_1 = require("../util/process.string.util");
const common_1 = require("@nestjs/common");
const file_service_1 = require("../service/file.service");
const typeorm_1 = require("@nestjs/typeorm");
const restful_util_1 = require("../util/restful.util");
const bucket_entity_1 = require("../model/bucket.entity");
const image_entity_1 = require("../model/image.entity");
const auth_util_1 = require("../util/auth.util");
const file_util_1 = require("../util/file.util");
const kind_util_1 = require("../util/kind.util");
const crypto = require("crypto");
const os = require("os");
class StoreComponent {
    constructor(kindUtil, fileUtil, authUtil, resufulUtil, fileService, processStringUtil, imageRepository, bucketRepository) {
        this.kindUtil = kindUtil;
        this.fileUtil = fileUtil;
        this.authUtil = authUtil;
        this.resufulUtil = resufulUtil;
        this.fileService = fileService;
        this.processStringUtil = processStringUtil;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
    }
    delete(bucketName, name, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bucketName || !name || !type) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.findOne({ name: bucketName });
            if (!bucket) {
                throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
            }
            let file;
            const kind = this.kindUtil.getKind(type);
            if (kind === "image") {
                file = yield this.imageRepository.findOne({ name, bucketId: bucket.id });
                if (!file) {
                    throw new common_1.HttpException("文件" + name + "不存在于数据库中", 404);
                }
                yield this.imageRepository.remove(file);
            }
            else {
            }
            yield this.resufulUtil.deleteFile(bucket, file);
            return;
        });
    }
    upload(bucketName, rawName, base64, imagePreProcessInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bucketName || !rawName || !base64) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.createQueryBuilder("bucket")
                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                .where("bucket.name = :name", { name: bucketName })
                .getOne();
            if (!bucket) {
                throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
            }
            const buffer = Buffer.from(base64, "base64");
            const md5 = crypto.createHash("md5").update(buffer).digest("hex");
            const name = md5 + "_" + (+new Date());
            const tempPath = os.tmpdir + "/" + rawName;
            yield this.fileUtil.write(tempPath, buffer);
            let file;
            const uploadFile = { path: tempPath };
            let type = rawName.substring(rawName.lastIndexOf(".") + 1);
            const kind = this.kindUtil.getKind(type);
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
                    const { width, height, frames } = yield this.resufulUtil.uploadFile(bucket, file, uploadFile, imagePreProcessInfo);
                    const { fileSize, fileMd5 } = yield this.resufulUtil.getFileInfo(bucket, file);
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
                    yield this.imageRepository.save(file);
                }
                else {
                }
            }
            catch (err) {
                throw err;
            }
            finally {
                yield this.fileUtil.deleteIfExist(tempPath);
            }
            return { bucketName, name, type };
        });
    }
    getUrl(req, bucketName, name, type, imagePostProcessInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bucketName || !name || !type) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.createQueryBuilder("bucket")
                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                .where("bucket.name = :name", { name: bucketName })
                .getOne();
            if (!bucket) {
                throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
            }
            let url;
            let file;
            const kind = this.kindUtil.getKind(type);
            if (kind === "image") {
                file = yield this.imageRepository.findOne({ name, bucketId: bucket.id });
                if (!file) {
                    throw new common_1.HttpException("指定图片" + name + "." + type + "不存在", 404);
                }
            }
            else {
            }
            url = yield this.fileService.makeUrl(bucket, file, { imagePostProcessInfo }, kind);
            return url;
        });
    }
}
exports.StoreComponent = StoreComponent;
exports.StoreComponentToken = "StoreComponentToken";
exports.StoreComponentProvider = {
    provide: exports.StoreComponentToken,
    useFactory: (kindUtil, fileUtil, authUtil, restfulUtil, fileService, processStringUtil, imageRepository, bucketRepository) => {
        return new StoreComponent(kindUtil, fileUtil, authUtil, restfulUtil, fileService, processStringUtil, imageRepository, bucketRepository);
    },
    inject: [
        kind_util_1.KindUtil,
        file_util_1.FileUtil,
        auth_util_1.AuthUtil,
        restful_util_1.RestfulUtil,
        file_service_1.FileService,
        process_string_util_1.ProcessStringUtil,
        typeorm_1.getRepositoryToken(image_entity_1.Image),
        typeorm_1.getRepositoryToken(bucket_entity_1.Bucket),
    ],
};

//# sourceMappingURL=store.component.provider.js.map
