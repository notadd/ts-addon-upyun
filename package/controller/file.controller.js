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
const typeorm_1 = require("@nestjs/typeorm");
const path = require("path");
const typeorm_2 = require("typeorm");
const upyun_exception_filter_1 = require("../exception/upyun.exception.filter");
const bucket_entity_1 = require("../model/bucket.entity");
const file_entity_1 = require("../model/file.entity");
const image_entity_1 = require("../model/image.entity");
const file_service_1 = require("../service/file.service");
const auth_util_1 = require("../util/auth.util");
const kind_util_1 = require("../util/kind.util");
const restful_util_1 = require("../util/restful.util");
let FileController = class FileController {
    constructor(authUtil, kindUtil, restfulUtil, fileService, fileRepository, imageRepository, bucketRepository) {
        this.authUtil = authUtil;
        this.kindUtil = kindUtil;
        this.restfulUtil = restfulUtil;
        this.fileService = fileService;
        this.fileRepository = fileRepository;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
    }
    asyncNotify(body, req, headers, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const contentType = headers["content-type"];
            const contentMd5 = headers["content-md5"];
            const auth = headers.authorization;
            const date = headers.date;
            if (contentType === "application/x-www-form-urlencoded") {
                const code = +body.code;
                if (code !== 200) {
                    throw new common_1.HttpException("上传失败,返回200告诉又拍云不要再发送回调信息", 200);
                }
                const name = path.parse(body.url).name;
                const type = path.parse(body.url).ext.substr(1);
                const kind = this.kindUtil.getKind(type);
                const bucketName = body["ext-param"];
                const bucket = yield this.bucketRepository.findOne({ name: bucketName });
                if (!bucket) {
                    throw new common_1.HttpException("空间不存在，说明是内部错误,返回200告诉又拍云不要再发送回调信息", 200);
                }
                const pass = yield this.authUtil.notifyVerify(auth, bucket, "POST", "/upyun/file/notify", date, contentMd5, body);
                if (!pass) {
                    throw new common_1.HttpException("验签失败,返回400告诉又拍云继续发送回调信息", 400);
                }
                if (kind === "image") {
                    const image = new image_entity_1.Image();
                    image.name = name;
                    image.type = type;
                    yield this.restfulUtil.deleteFile(bucket, image);
                }
                else {
                }
            }
            else if (contentType === "application/json") {
                const code = body.status_code;
                if (code !== 200) {
                    throw new common_1.HttpException("预处理失败,返回200告诉又拍云不要再发送回调信息", 200);
                }
                const bucketName = body.bucket_name;
                const name = path.parse(body.imginfo.path).name;
                const type = path.parse(body.imginfo.path).ext.substr(1);
                const kind = this.kindUtil.getKind(type);
                const bucket = yield this.bucketRepository.findOne({ name: bucketName });
                const pass = yield this.authUtil.taskNotifyVerify(auth, bucket, "POST", "/upyun/file/notify", date, contentMd5, body);
                if (!pass) {
                    throw new common_1.HttpException("验签失败,返回400告诉又拍云继续发送回调信息", 400);
                }
                yield this.fileService.postSaveTask(bucket, name, body, kind);
            }
            res.sendStatus(200);
            res.end();
            return;
        });
    }
};
__decorate([
    common_1.Post("notify"),
    __param(0, common_1.Body()), __param(1, common_1.Request()), __param(2, common_1.Headers()), __param(3, common_1.Response()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "asyncNotify", null);
FileController = __decorate([
    common_1.Controller("upyun/file"),
    common_1.UseFilters(new upyun_exception_filter_1.UpyunExceptionFilter()),
    __param(0, common_1.Inject(auth_util_1.AuthUtil)),
    __param(1, common_1.Inject(kind_util_1.KindUtil)),
    __param(2, common_1.Inject(restful_util_1.RestfulUtil)),
    __param(3, common_1.Inject(file_service_1.FileService)),
    __param(4, typeorm_1.InjectRepository(file_entity_1.File)),
    __param(5, typeorm_1.InjectRepository(image_entity_1.Image)),
    __param(6, typeorm_1.InjectRepository(bucket_entity_1.Bucket)),
    __metadata("design:paramtypes", [auth_util_1.AuthUtil,
        kind_util_1.KindUtil,
        restful_util_1.RestfulUtil,
        file_service_1.FileService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FileController);
exports.FileController = FileController;

//# sourceMappingURL=file.controller.js.map
