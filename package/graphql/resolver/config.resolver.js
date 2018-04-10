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
var config_service_1 = require("../../service/config.service");
var file_util_1 = require("../../util/file.util");
var kind_util_1 = require("../../util/kind.util");
var restful_util_1 = require("../../util/restful.util");
/* 空间基本配置的resolver */
var ConfigResolver = /** @class */ (function () {
    function ConfigResolver(fileUtil, kindUtil, restfulUtil, configService, bucketRepository) {
        this.fileUtil = fileUtil;
        this.kindUtil = kindUtil;
        this.restfulUtil = restfulUtil;
        this.configService = configService;
        this.bucketRepository = bucketRepository;
        this.gravity = new Set(["northwest", "north", "northeast", "west", "center", "east", "southwest", "south", "southeast"]);
    }
    /* 配置空间基本信息 */
    ConfigResolver.prototype.bucket = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var isPublic, name, operator, password, directory, baseUrl, requestExpire, bucket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isPublic = body.isPublic, name = body.name, operator = body.operator, password = body.password, directory = body.directory, baseUrl = body.baseUrl, requestExpire = body.requestExpire;
                        if (isPublic === undefined || !name || !operator || !password || !directory || !baseUrl || !requestExpire) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        if (isPublic !== true && isPublic !== false && isPublic !== "true" && isPublic !== "false") {
                            throw new common_1.HttpException("isPublic参数不正确", 400);
                        }
                        if (!Number.isInteger(body.requestExpire)) {
                            throw new common_1.HttpException("请求超时参数为非整数", 400);
                        }
                        else if (body.requestExpire < 0) {
                            throw new common_1.HttpException("请求超时参数小于0", 400);
                        }
                        else if (body.requestExpire > 1800) {
                            throw new common_1.HttpException("请求超时参数大于1800", 400);
                        }
                        if (!isPublic) {
                            if (!Number.isInteger(body.tokenExpire)) {
                                throw new common_1.HttpException("token超时参数为非整数", 400);
                            }
                            else if (body.tokenExpire < 0) {
                                throw new common_1.HttpException("token超时参数小于0", 400);
                            }
                            else if (body.tokenExpire > 1800) {
                                throw new common_1.HttpException("token超时参数大于1800", 400);
                            }
                        }
                        return [4 /*yield*/, this.configService.saveBucketConfig(body)];
                    case 1:
                        bucket = _a.sent();
                        return [4 /*yield*/, this.restfulUtil.createDirectory(bucket)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { code: 200, message: "空间配置成功" }];
                }
            });
        });
    };
    /* 图片保存格式配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
    ConfigResolver.prototype.imageFormat = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var format;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        format = body.format;
                        if (format === undefined || format.length === 0) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        // 保存格式
                        return [4 /*yield*/, this.configService.saveImageFormatConfig(body)];
                    case 1:
                        // 保存格式
                        _a.sent();
                        return [2 /*return*/, { code: 200, message: "图片保存格式配置成功" }];
                }
            });
        });
    };
    ConfigResolver.prototype.enableImageWatermark = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var enable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enable = body.enable;
                        if (enable === undefined || enable === undefined) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        // enable参数错误
                        if (enable !== true && enable !== false) {
                            throw new common_1.HttpException("参数错误", 400);
                        }
                        return [4 /*yield*/, this.configService.saveEnableImageWatermarkConfig(body)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { code: 200, message: "启用图片水印成功" }];
                }
            });
        });
    };
    /* 保存水印配置，目前两个空间采用同一个图片水印，忽略文字水印、忽略多水印
       水印图片必须与被加水印图片在同一个服务名下，所以需要在两个空间下各保存一次
       为了向前端提供统一接口，这里采用将水印图片上传到服务器，由服务发起restful上传请求的方式
       如果客户端上传，客户端调用会比较繁杂
    */
    ConfigResolver.prototype.imageWatermarkConfig = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var tempPath, name_1, base64, gravity, opacity, x, y, ws, obj, file, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempPath = __dirname + "/" + body.name;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 7]);
                        name_1 = body.name, base64 = body.base64, gravity = body.gravity, opacity = body.opacity, x = body.x, y = body.y, ws = body.ws;
                        return [4 /*yield*/, this.fileUtil.write(tempPath, Buffer.from(base64, "base64"))];
                    case 2:
                        _a.sent();
                        obj = {};
                        file = {};
                        obj.x = x;
                        obj.y = y;
                        obj.opacity = opacity;
                        obj.ws = ws;
                        obj.gravity = gravity;
                        file.name = name_1;
                        file.path = tempPath;
                        if (!this.gravity.has(obj.gravity)) {
                            throw new common_1.HttpException("不允许的水印图片位置", 400);
                        }
                        if (!Number.isInteger(obj.x)) {
                            throw new common_1.HttpException("x偏移不是整数", 400);
                        }
                        if (!Number.isInteger(obj.y)) {
                            throw new common_1.HttpException("y偏移不是整数", 400);
                        }
                        if (!Number.isInteger(obj.opacity)) {
                            throw new common_1.HttpException("透明度不是整数", 400);
                        }
                        else if (obj.opacity <= 0) {
                            throw new common_1.HttpException("透明度不大于0", 400);
                        }
                        else if (obj.opacity > 100) {
                            throw new common_1.HttpException("透明度大于100", 400);
                        }
                        else {
                        }
                        if (!Number.isInteger(obj.ws)) {
                            throw new common_1.HttpException("短边自适应比例不是整数", 400);
                        }
                        else if (obj.ws <= 0) {
                            throw new common_1.HttpException("短边自适应比例不大于0", 400);
                        }
                        else {
                            // 暂定短边自适应比例可以大于100
                        }
                        if (!this.kindUtil.isImage(file.name.substr(file.name.lastIndexOf(".") + 1))) {
                            throw new common_1.HttpException("不允许的水印图片类型", 400);
                        }
                        // 保存后台水印配置
                        return [4 /*yield*/, this.configService.saveImageWatermarkConfig(file, obj)];
                    case 3:
                        // 保存后台水印配置
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        err_1 = _a.sent();
                        throw err_1;
                    case 5: return [4 /*yield*/, this.fileUtil["delete"](tempPath)];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/, { code: 200, message: "图片水印配置成功" }];
                }
            });
        });
    };
    /* 音频保存格式配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
    ConfigResolver.prototype.audioFormat = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var format;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        format = body.format;
                        if (!format) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        // 保存公有空间格式
                        return [4 /*yield*/, this.configService.saveAudioFormatConfig(body)];
                    case 1:
                        // 保存公有空间格式
                        _a.sent();
                        return [2 /*return*/, { code: 200, message: "音频保存格式配置成功" }];
                }
            });
        });
    };
    /* 视频保存配置，目前公有空间、私有空间采用一个保存格式，会在两个配置信息中各保存一次 */
    ConfigResolver.prototype.videoFormat = function (req, body) {
        return __awaiter(this, void 0, void 0, function () {
            var format, resolution;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        format = body.format, resolution = body.resolution;
                        if (!format || !resolution) {
                            throw new common_1.HttpException("缺少参数", 400);
                        }
                        // 保存公有空间格式
                        return [4 /*yield*/, this.configService.saveVideoFormatConfig(body)];
                    case 1:
                        // 保存公有空间格式
                        _a.sent();
                        return [2 /*return*/, { code: 200, message: "视频保存格式配置成功" }];
                }
            });
        });
    };
    /* 获取所有空间信息字段 */
    ConfigResolver.prototype.buckets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buckets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucketRepository.createQueryBuilder("bucket")
                            .select(["bucket.id", "bucket.publicOrPrivate", "bucket.name"])
                            .getMany()];
                    case 1:
                        buckets = _a.sent();
                        if (buckets.length !== 2) {
                            throw new common_1.HttpException("空间配置不存在", 401);
                        }
                        return [2 /*return*/, { code: 200, message: "获取空间配置成功", buckets: buckets }];
                }
            });
        });
    };
    __decorate([
        graphql_1.Mutation("bucket")
    ], ConfigResolver.prototype, "bucket");
    __decorate([
        graphql_1.Mutation("imageFormat")
    ], ConfigResolver.prototype, "imageFormat");
    __decorate([
        graphql_1.Mutation("enableImageWatermark")
    ], ConfigResolver.prototype, "enableImageWatermark");
    __decorate([
        graphql_1.Mutation("imageWatermark")
    ], ConfigResolver.prototype, "imageWatermarkConfig");
    __decorate([
        graphql_1.Mutation("audioFormat")
    ], ConfigResolver.prototype, "audioFormat");
    __decorate([
        graphql_1.Mutation("videoFormat")
    ], ConfigResolver.prototype, "videoFormat");
    __decorate([
        graphql_1.Query("buckets")
    ], ConfigResolver.prototype, "buckets");
    ConfigResolver = __decorate([
        graphql_1.Resolver("Config"),
        common_1.UseInterceptors(exception_interceptor_1.ExceptionInterceptor),
        __param(0, common_1.Inject(file_util_1.FileUtil)),
        __param(1, common_1.Inject(kind_util_1.KindUtil)),
        __param(2, common_1.Inject(restful_util_1.RestfulUtil)),
        __param(3, common_1.Inject(config_service_1.ConfigService)),
        __param(4, typeorm_1.InjectRepository(bucket_entity_1.Bucket))
    ], ConfigResolver);
    return ConfigResolver;
}());
exports.ConfigResolver = ConfigResolver;
