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
var common_1 = require("@nestjs/common");
var graphql_1 = require("@nestjs/graphql");
var typeorm_1 = require("@nestjs/typeorm");
var exception_interceptor_1 = require("../../interceptor/exception.interceptor");
var bucket_entity_1 = require("../../model/bucket.entity");
var file_entity_1 = require("../../model/file.entity");
var image_entity_1 = require("../../model/image.entity");
var config_service_1 = require("../../service/config.service");
var file_service_1 = require("../../service/file.service");
var auth_util_1 = require("../../util/auth.util");
var kind_util_1 = require("../../util/kind.util");
var restful_util_1 = require("../../util/restful.util");
var FileResolver = /** @class */ (function () {
    function FileResolver(authUtil, kindUtil, restfulUtil, fileService, configService, fileRepository, imageRepository, bucketRepository) {
        this.authUtil = authUtil;
        this.kindUtil = kindUtil;
        this.restfulUtil = restfulUtil;
        this.fileService = fileService;
        this.configService = configService;
        this.fileRepository = fileRepository;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
    }
    FileResolver.prototype.downloadProcess = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var data, bucketName, name, type, bucket, status, file, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = {
                            code: 200,
                            message: "下载预处理成功",
                            method: "get",
                            headers: {
                                authorization: "",
                                date: ""
                            },
                            url: "https://v0.api.upyun.com"
                        };
                        bucketName = body.bucketName, name = body.name, type = body.type;
                        if (!bucketName || !name) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.findOne({ name: bucketName })];
                    case 1:
                        bucket = _b.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
                        }
                        status = "post";
                        if (!this.kindUtil.isImage(type)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.imageRepository.findOne({ name: name, type: type, bucketId: bucket.id })];
                    case 2:
                        file = _b.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        if (!file) {
                            throw new common_1.HttpException("指定文件" + name + "不存在", 404);
                        }
                        data.url += "/" + bucket.name + "/" + bucket.directory + "/" + file.name + "." + file.type;
                        data.headers.date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        _a = data.headers;
                        return [4 /*yield*/, this.authUtil.getHeaderAuth(bucket, "GET", data.url.replace("https://v0.api.upyun.com", ""), data.headers.date, "")];
                    case 4:
                        _a.authorization = _b.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    FileResolver.prototype.uploadProcess = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var data, bucketName, md5, contentName, bucket, image, policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
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
                        bucketName = body.bucketName, md5 = body.md5, contentName = body.contentName;
                        if (!bucketName || !md5 || !contentName) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        if (md5.length !== 32) {
                            throw new common_1.HttpException("md5参数不正确", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.createQueryBuilder("bucket")
                                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                                .leftJoinAndSelect("bucket.audioConfig", "audioConfig")
                                .leftJoinAndSelect("bucket.videoConfig", "videoConfig")
                                .where("bucket.name = :name", { name: bucketName })
                                .getOne()];
                    case 1:
                        bucket = _a.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("指定空间" + bucketName + "不存在", 401);
                        }
                        data.baseUrl = bucket.baseUrl;
                        return [4 /*yield*/, this.fileService.preSaveFile(bucket, body)];
                    case 2:
                        image = _a.sent();
                        policy = {
                            // 空间名
                            "bucket": "",
                            // 文件保存路径，包括目录、文件名、扩展名
                            "save-key": "",
                            // 请求过期事件
                            "expiration": undefined,
                            "date": "",
                            "content-md5": md5,
                            // 异步回调通知路径，图片异步预处理回调也是这个接口
                            "notify-url": req.protocol + "://" + req.get("host") + "/upyun/file/notify",
                            // 图片生存期限默认为180天
                            "x-upyun-meta-ttl": 180,
                            // 扩展参数，包含了空间名
                            "ext-param": ""
                        };
                        // 获取后台配置，创建上传参数，返回文件种类、以及文件所属目录
                        return [4 /*yield*/, this.fileService.makePolicy(data, policy, bucket, body, image)];
                    case 3:
                        // 获取后台配置，创建上传参数，返回文件种类、以及文件所属目录
                        _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /* 获取单个文件url方法 ，从后台获取
      @Param bucketName：空间名
      @Param name：       文件名，不包括扩展名
      @Param type:        文件类型
      @Param imagePostProcessInfo 文件后处理信息，获取url做图的字符串
      @Return data.code：状态码，200为成功，其他为错误
              data.message：响应信息
              data.url：访问文件的全部url，包括域名、目录、文件名、扩展名、token、文件密钥、处理字符串
   */
    FileResolver.prototype.getFile = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var bucketName, name, type, bucket, kind, file, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bucketName = body.bucketName, name = body.name, type = body.type;
                        if (!bucketName || !name || !type) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.createQueryBuilder("bucket")
                                .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
                                .leftJoinAndSelect("bucket.audioConfig", "audioConfig")
                                .leftJoinAndSelect("bucket.videoConfig", "videoConfig")
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
                            throw new common_1.HttpException("指定图片不存在", 404);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [4 /*yield*/, this.fileService.makeUrl(bucket, file, body, kind)];
                    case 4:
                        url = _a.sent();
                        return [2 /*return*/, { code: 200, message: "获取指定文件访问url成功", url: url }];
                }
            });
        });
    };
    /* 获取指定空间下文件，从后台数据库中获取
       @Param bucketName：文件所属空间
       @Return data.code： 状态码，200为成功，其他为错误
              data.message：响应信息
              data.baseUrl：访问文件的基本url
              data.files    分页后的文件信息数组，里面添加了访问文件url信息，url不包含域名，包含了文件密钥、token
              data.imges：   图片信息数组
              data.audios:  音频信息数组
              data.videos:  视频信息数组
              data.documents: 文档信息数组
    */
    FileResolver.prototype.files = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var data, bucketName, bucket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            code: 200,
                            message: "获取指定空间下所有文件成功",
                            baseUrl: "",
                            files: [],
                            images: [],
                            audios: [],
                            videos: [],
                            documents: []
                        };
                        bucketName = body.bucketName;
                        if (!bucketName) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.findOne({ name: bucketName })];
                    case 1:
                        bucket = _a.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("空间" + bucketName + "不存在", 401);
                        }
                        data.baseUrl = bucket.baseUrl;
                        return [4 /*yield*/, this.fileService.getAll(data, bucket)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /* 文件删除接口
       当客户端需要删除某个文件时使用，
       @Param bucketName：文件所属空间名
       @Param type：       文件扩展名，即文件类型
       @Param name：       文件名
       @Return data.code：状态码，200为成功，其他为错误
               data.message：响应信息
    */
    FileResolver.prototype.deleteFile = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var bucketName, type, name, bucket, kind, image;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bucketName = body.bucketName, type = body.type, name = body.name;
                        if (!bucketName || !name || !type) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.findOne({ name: bucketName })];
                    case 1:
                        bucket = _a.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("空间" + bucketName + "不存在", 401);
                        }
                        kind = this.kindUtil.getKind(type);
                        if (!(kind === "image")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.imageRepository.findOne({ name: name, bucketId: bucket.id })];
                    case 2:
                        image = _a.sent();
                        if (!image) {
                            throw new common_1.HttpException("文件md5=" + name + "不存在", 404);
                        }
                        return [4 /*yield*/, this.restfulUtil.deleteFile(bucket, image)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.imageRepository["delete"]({ name: name, bucketId: bucket.id })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, { code: 200, message: "删除文件成功" }];
                }
            });
        });
    };
    __decorate([
        graphql_1.Query("downloadProcess")
    ], FileResolver.prototype, "downloadProcess");
    __decorate([
        graphql_1.Mutation("uploadProcess")
    ], FileResolver.prototype, "uploadProcess");
    __decorate([
        graphql_1.Query("one")
    ], FileResolver.prototype, "getFile");
    __decorate([
        graphql_1.Query("all")
    ], FileResolver.prototype, "files");
    __decorate([
        graphql_1.Mutation("deleteFile")
    ], FileResolver.prototype, "deleteFile");
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
        __param(7, typeorm_1.InjectRepository(bucket_entity_1.Bucket))
    ], FileResolver);
    return FileResolver;
}());
exports.FileResolver = FileResolver;
