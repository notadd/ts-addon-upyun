"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("@nestjs/typeorm");
const http_1 = require("http");
const typeorm_2 = require("typeorm");
const exception_interceptor_1 = require("../interceptor/exception.interceptor");
const bucket_entity_1 = require("../model/bucket.entity");
const file_entity_1 = require("../model/file.entity");
const image_entity_1 = require("../model/image.entity");
const config_service_1 = require("../service/config.service");
const file_service_1 = require("../service/file.service");
const auth_util_1 = require("../util/auth.util");
const kind_util_1 = require("../util/kind.util");
const restful_util_1 = require("../util/restful.util");
let FileResolver = class FileResolver {
    constructor(authUtil, kindUtil, restfulUtil, fileService, configService, fileRepository, imageRepository, bucketRepository) {
        this.authUtil = authUtil;
        this.kindUtil = kindUtil;
        this.restfulUtil = restfulUtil;
        this.fileService = fileService;
        this.configService = configService;
        this.fileRepository = fileRepository;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
    }
    downloadProcess(req, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                code: 200,
                message: "下载预处理成功",
                method: "get",
                headers: {
                    authorization: "",
                    date: ""
                },
                url: "https://v0.api.upyun.com"
            };
            const { bucketName, name, type } = body;
            if (!bucketName || !name) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.findOne({ name: bucketName });
            if (!bucket) {
                throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
            }
            const status = "post";
            let file;
            if (this.kindUtil.isImage(type)) {
                file = yield this.imageRepository.findOne({ name, type, bucketId: bucket.id });
            }
            else {
            }
            if (!file) {
                throw new common_1.HttpException("指定文件" + name + "不存在", 404);
            }
            data.url += "/" + bucket.name + "/" + bucket.directory + "/" + file.name + "." + file.type;
            data.headers.date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            data.headers.authorization = yield this.authUtil.getHeaderAuth(bucket, "GET", data.url.replace("https://v0.api.upyun.com", ""), data.headers.date, "");
            return data;
        });
    }
    uploadProcess(req, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                code: 200,
                message: "上传预处理成功",
                url: "https://v0.api.upyun.com",
                method: "post",
                baseUrl: "",
                form: {
                    policy: "",
                    authorization: ""
                }
            };
            const { bucketName, md5, contentName } = body;
            if (!bucketName || !md5 || !contentName) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            if (md5.length !== 32) {
                throw new common_1.HttpException("md5参数不正确", 400);
            }
            const bucket = yield this.bucketRepository.createQueryBuilder("bucket")
                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                .leftJoinAndSelect("bucket.audioConfig", "audioConfig")
                .leftJoinAndSelect("bucket.videoConfig", "videoConfig")
                .where("bucket.name = :name", { name: bucketName })
                .getOne();
            if (!bucket) {
                throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
            }
            data.baseUrl = bucket.baseUrl;
            const image = yield this.fileService.preSaveFile(bucket, body);
            const policy = {
                "bucket": "",
                "save-key": "",
                "expiration": undefined,
                "date": "",
                "content-md5": md5,
                "notify-url": req.protocol + "://" + req.get("host") + "/upyun/file/notify",
                "x-upyun-meta-ttl": 180,
                "ext-param": ""
            };
            yield this.fileService.makePolicy(data, policy, bucket, body, image);
            return data;
        });
    }
    getFile(req, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bucketName, name, type } = body;
            if (!bucketName || !name || !type) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.createQueryBuilder("bucket")
                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                .leftJoinAndSelect("bucket.audioConfig", "audioConfig")
                .leftJoinAndSelect("bucket.videoConfig", "videoConfig")
                .where("bucket.name = :name", { name: bucketName })
                .getOne();
            if (!bucket) {
                throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
            }
            const kind = this.kindUtil.getKind(type);
            let file;
            if (kind === "image") {
                file = yield this.imageRepository.findOne({ name, bucketId: bucket.id });
                if (!file) {
                    throw new common_1.HttpException("指定图片不存在", 404);
                }
            }
            else {
            }
            const url = yield this.fileService.makeUrl(bucket, file, body, kind);
            return { code: 200, message: "获取指定文件访问url成功", url };
        });
    }
    files(req, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                code: 200,
                message: "获取指定空间下所有文件成功",
                baseUrl: "",
                files: [],
                images: [],
                audios: [],
                videos: [],
                documents: []
            };
            const { bucketName } = body;
            if (!bucketName) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.findOne({ name: bucketName });
            if (!bucket) {
                throw new common_1.HttpException("空间" + bucketName + "不存在", 401);
            }
            data.baseUrl = bucket.baseUrl;
            yield this.fileService.getAll(data, bucket);
            return data;
        });
    }
    deleteFile(req, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bucketName, type, name } = body;
            if (!bucketName || !name || !type) {
                throw new common_1.HttpException("缺少参数", 400);
            }
            const bucket = yield this.bucketRepository.findOne({ name: bucketName });
            if (!bucket) {
                throw new common_1.HttpException("空间" + bucketName + "不存在", 401);
            }
            const kind = this.kindUtil.getKind(type);
            if (kind === "image") {
                const image = yield this.imageRepository.findOne({ name, bucketId: bucket.id });
                if (!image) {
                    throw new common_1.HttpException("文件md5=" + name + "不存在", 404);
                }
                yield this.restfulUtil.deleteFile(bucket, image);
                yield this.imageRepository.delete({ name, bucketId: bucket.id });
            }
            return { code: 200, message: "删除文件成功" };
        });
    }
};
__decorate([
    graphql_1.Query("downloadProcess"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [http_1.IncomingMessage, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "downloadProcess", null);
__decorate([
    graphql_1.Mutation("uploadProcess"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "uploadProcess", null);
__decorate([
    graphql_1.Query("one"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [http_1.IncomingMessage, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "getFile", null);
__decorate([
    graphql_1.Query("all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [http_1.IncomingMessage, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "files", null);
__decorate([
    graphql_1.Mutation("deleteFile"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [http_1.IncomingMessage, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "deleteFile", null);
FileResolver = __decorate([
    graphql_1.Resolver("File"),
    common_1.UseInterceptors(exception_interceptor_1.ExceptionInterceptor),
    __param(0, common_1.Inject(auth_util_1.AuthUtil)),
    __param(1, common_1.Inject(kind_util_1.KindUtil)),
    __param(2, common_1.Inject(restful_util_1.RestfulUtil)),
    __param(3, common_1.Inject(file_service_1.FileService)),
    __param(4, common_1.Inject(config_service_1.ConfigService)),
    __param(5, typeorm_1.InjectRepository(file_entity_1.File)),
    __param(6, typeorm_1.InjectRepository(image_entity_1.Image)),
    __param(7, typeorm_1.InjectRepository(bucket_entity_1.Bucket)),
    __metadata("design:paramtypes", [auth_util_1.AuthUtil,
        kind_util_1.KindUtil,
        restful_util_1.RestfulUtil,
        file_service_1.FileService,
        config_service_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FileResolver);
exports.FileResolver = FileResolver;

//# sourceMappingURL=file.resolver.js.map
