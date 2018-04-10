"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var crypto = require("crypto");
var os = require("os");
var common_1 = require("@nestjs/common");
var file_service_1 = require("../service/file.service");
var auth_util_1 = require("../util/auth.util");
var file_util_1 = require("../util/file.util");
var kind_util_1 = require("../util/kind.util");
var process_string_util_1 = require("../util/process.string.util");
var restful_util_1 = require("../util/restful.util");
var StoreComponent = /** @class */ (function () {
    function StoreComponent(kindUtil, fileUtil, authUtil, resufulUtil, fileService, processStringUtil, imageRepository, bucketRepository) {
        this.kindUtil = kindUtil;
        this.fileUtil = fileUtil;
        this.authUtil = authUtil;
        this.resufulUtil = resufulUtil;
        this.fileService = fileService;
        this.processStringUtil = processStringUtil;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
    }
    StoreComponent.prototype["delete"] = function (bucketName, name, type) {
        return __awaiter(this, void 0, void 0, function () {
            var bucket, file, kind;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 验证参数
                        if (!bucketName || !name || !type) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.findOne({ name: bucketName })];
                    case 1:
                        bucket = _a.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
                        }
                        kind = this.kindUtil.getKind(type);
                        if (!(kind === "image")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.imageRepository.findOne({ name: name, bucketId: bucket.id })];
                    case 2:
                        file = _a.sent();
                        if (!file) {
                            throw new common_1.HttpException("文件" + name + "不存在于数据库中", 404);
                        }
                        return [4 /*yield*/, this.imageRepository.deleteById(file.id)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.resufulUtil.deleteFile(bucket, file)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StoreComponent.prototype.upload = function (bucketName, rawName, base64, imagePreProcessInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var bucket, buffer, md5, name, tempPath, file, uploadFile, type, kind, _a, width, height, frames_1, _b, fileSize, fileMd5, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!bucketName || !rawName || !base64) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.createQueryBuilder("bucket")
                                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                                .where("bucket.name = :name", { name: bucketName })
                                .getOne()];
                    case 1:
                        bucket = _c.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
                        }
                        buffer = Buffer.from(base64, "base64");
                        md5 = crypto.createHash("md5").update(buffer).digest("hex");
                        name = md5 + "_" + (+new Date());
                        tempPath = os.tmpdir + "/" + rawName;
                        return [4 /*yield*/, this.fileUtil.write(tempPath, buffer)];
                    case 2:
                        _c.sent();
                        uploadFile = { path: tempPath };
                        type = rawName.substring(rawName.lastIndexOf(".") + 1);
                        if (bucket.imageConfig.format === "webp_damage" || bucket.imageConfig.format === "webp_undamage") {
                            type = "webp";
                        }
                        kind = this.kindUtil.getKind(type);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 8, 9, 11]);
                        if (!(kind === "image")) return [3 /*break*/, 7];
                        file = this.imageRepository.create({
                            bucket: bucket,
                            rawName: rawName,
                            name: name,
                            type: type,
                            md5: md5,
                            status: "post"
                        });
                        return [4 /*yield*/, this.resufulUtil.uploadFile(bucket, file, uploadFile, imagePreProcessInfo)];
                    case 4:
                        _a = _c.sent(), width = _a.width, height = _a.height, frames_1 = _a.frames;
                        return [4 /*yield*/, this.resufulUtil.getFileInfo(bucket, file)];
                    case 5:
                        _b = _c.sent(), fileSize = _b.fileSize, fileMd5 = _b.fileMd5;
                        file = this.imageRepository.create({
                            bucket: bucket,
                            rawName: rawName,
                            name: name,
                            type: type,
                            width: width,
                            height: height,
                            frames: frames_1,
                            size: fileSize,
                            md5: fileMd5,
                            status: "post"
                        });
                        return [4 /*yield*/, this.imageRepository.save(file)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        err_1 = _c.sent();
                        throw err_1;
                    case 9: 
                    // 如果中间过程抛出了异常，要保证删除临时图片
                    return [4 /*yield*/, this.fileUtil.deleteIfExist(tempPath)];
                    case 10:
                        // 如果中间过程抛出了异常，要保证删除临时图片
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/, { bucketName: bucketName, name: name, type: type }];
                }
            });
        });
    };
    StoreComponent.prototype.getUrl = function (req, bucketName, name, type, imagePostProcessInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var bucket, url, file, kind;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 验证参数
                        if (!bucketName || !name || !type) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.createQueryBuilder("bucket")
                                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                                .where("bucket.name = :name", { name: bucketName })
                                .getOne()];
                    case 1:
                        bucket = _a.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
                        }
                        kind = this.kindUtil.getKind(type);
                        if (!(kind === "image")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.imageRepository.findOne({ name: name, bucketId: bucket.id })];
                    case 2:
                        file = _a.sent();
                        if (!file) {
                            throw new common_1.HttpException("指定图片" + name + "." + type + "不存在", 404);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [4 /*yield*/, this.fileService.makeUrl(bucket, file, { imagePostProcessInfo: imagePostProcessInfo }, kind)];
                    case 4:
                        url = _a.sent();
                        return [2 /*return*/, url];
                }
            });
        });
    };
    StoreComponent = __decorate([
        __param(0, common_1.Inject(kind_util_1.KindUtil)),
        __param(1, common_1.Inject(file_util_1.FileUtil)),
        __param(2, common_1.Inject(auth_util_1.AuthUtil)),
        __param(3, common_1.Inject(restful_util_1.RestfulUtil)),
        __param(4, common_1.Inject(file_service_1.FileService)),
        __param(5, common_1.Inject(process_string_util_1.ProcessStringUtil)),
        __param(6, common_1.Inject("UpyunModule.ImageRepository")),
        __param(7, common_1.Inject("UpyunModule.BucketRepository"))
    ], StoreComponent);
    return StoreComponent;
}());
exports.StoreComponent = StoreComponent;
exports.StoreComponentProvider = {
    provide: "StoreComponentToken",
    useFactory: function (kindUtil, fileUtil, authUtil, restfulUtil, fileService, processStringUtil, imageRepository, bucketRepository) {
        return new StoreComponent(kindUtil, fileUtil, authUtil, restfulUtil, fileService, processStringUtil, imageRepository, bucketRepository);
    },
    inject: [
        kind_util_1.KindUtil,
        file_util_1.FileUtil,
        auth_util_1.AuthUtil,
        restful_util_1.RestfulUtil,
        file_service_1.FileService,
        process_string_util_1.ProcessStringUtil,
        "ImageRepository",
        "BucketRepository",
    ]
};
