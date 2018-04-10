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
var typeorm_1 = require("@nestjs/typeorm");
var crypto = require("crypto");
var audio_config_entity_1 = require("../model/audio.config.entity");
var bucket_entity_1 = require("../model/bucket.entity");
var image_entity_1 = require("../model/image.entity");
var image_config_entity_1 = require("../model/image.config.entity");
var video_config_entity_1 = require("../model/video.config.entity");
var file_util_1 = require("../util/file.util");
var restful_util_1 = require("../util/restful.util");
/* 配置服务组件，包含了保存公有空间、私有空间、格式、水印等配置项的功能
   还可以获取公有、私有配置
*/
var ConfigService = /** @class */ (function () {
    function ConfigService(fileUtil, restfulUtil, imageRepository, bucketRepository, imageConfigRepository, audioConfigRepository, videoConfigRepository) {
        this.fileUtil = fileUtil;
        this.restfulUtil = restfulUtil;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
        this.imageConfigRepository = imageConfigRepository;
        this.audioConfigRepository = audioConfigRepository;
        this.videoConfigRepository = videoConfigRepository;
    }
    ConfigService.prototype.saveBucketConfig = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var exist, newBucket, err_1, audio_config, video_config, imageConfig, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newBucket = this.bucketRepository.create({
                            name: body.name,
                            operator: body.operator,
                            password: crypto.createHash("md5").update(body.password).digest("hex"),
                            directory: body.directory,
                            baseUrl: body.baseUrl,
                            requestExpire: body.requestExpire
                        });
                        if (!body.isPublic) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.bucketRepository.findOneById(1)];
                    case 1:
                        exist = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.bucketRepository.findOneById(2)];
                    case 3:
                        exist = _a.sent();
                        newBucket.tokenExpire = body.tokenExpire;
                        newBucket.tokenSecretKey = body.tokenSecretKey;
                        _a.label = 4;
                    case 4:
                        if (!exist) return [3 /*break*/, 9];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.bucketRepository.updateById(exist.id, newBucket)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _a.sent();
                        throw new common_1.HttpException("空间配置更新失败" + err_1.toString(), 403);
                    case 8: return [2 /*return*/, newBucket];
                    case 9:
                        audio_config = new audio_config_entity_1.AudioConfig();
                        video_config = new video_config_entity_1.VideoConfig();
                        imageConfig = new image_config_entity_1.ImageConfig();
                        if (body.isPublic) {
                            newBucket.id = 1;
                            newBucket.publicOrPrivate = "public";
                        }
                        else {
                            newBucket.id = 2;
                            newBucket.publicOrPrivate = "private";
                        }
                        audio_config.id = newBucket.id;
                        video_config.id = newBucket.id;
                        imageConfig.id = newBucket.id;
                        newBucket.audioConfig = audio_config;
                        newBucket.videoConfig = video_config;
                        newBucket.imageConfig = imageConfig;
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.bucketRepository.save(newBucket)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        err_2 = _a.sent();
                        throw new common_1.HttpException("空间保存失败" + err_2.toString(), 403);
                    case 13: return [2 /*return*/, newBucket];
                }
            });
        });
    };
    ConfigService.prototype.saveImageFormatConfig = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var format, buckets, i, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        format = body.format;
                        format = format.toLowerCase();
                        if (format !== "raw" && format !== "webp_damage" && format !== "webp_undamage") {
                            throw new common_1.HttpException("图片保存格式不正确", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.find({ relations: ["imageConfig"] })];
                    case 1:
                        buckets = _a.sent();
                        if (buckets.length !== 2) {
                            throw new common_1.HttpException("空间配置不存在", 401);
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < buckets.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.imageConfigRepository.updateById(buckets[i].imageConfig.id, { format: format })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_3 = _a.sent();
                        throw new common_1.HttpException("图片保存格式更新失败" + err_3.toString(), 403);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ConfigService.prototype.saveEnableImageWatermarkConfig = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var buckets, watermarkEnable, i, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucketRepository.find({ relations: ["imageConfig"] })];
                    case 1:
                        buckets = _a.sent();
                        if (buckets.length !== 2) {
                            throw new common_1.HttpException("空间配置不存在", 401);
                        }
                        if (body.enable) {
                            watermarkEnable = 1;
                        }
                        else {
                            watermarkEnable = 0;
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < buckets.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.imageConfigRepository.updateById(buckets[i].imageConfig.id, { watermarkEnable: watermarkEnable })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_4 = _a.sent();
                        throw new common_1.HttpException("水印启用保存失败" + err_4.toString(), 403);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ConfigService.prototype.saveImageWatermarkConfig = function (file, obj) {
        return __awaiter(this, void 0, void 0, function () {
            var buckets, type, buffer, md5, i, image, _a, width, height, frames_1, _b, file_size, file_md5, err_5, err_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.bucketRepository.find({ relations: ["imageConfig"] })];
                    case 1:
                        buckets = _c.sent();
                        type = file.name.substr(file.name.lastIndexOf(".") + 1).toLowerCase();
                        if (buckets.length !== 2) {
                            throw new common_1.HttpException("空间配置不存在", 401);
                        }
                        return [4 /*yield*/, this.fileUtil.read(file.path)];
                    case 2:
                        buffer = _c.sent();
                        md5 = crypto.createHash("md5").update(buffer).digest("hex");
                        i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(i < buckets.length)) return [3 /*break*/, 13];
                        if (buckets[i].imageConfig.format === "webp_damage" || buckets[i].imageConfig.format === "webp_undamage") {
                            type = "webp";
                        }
                        image = new image_entity_1.Image();
                        // 这里有坑，如果之前使用了await bucket.images，那么这个bucket的性质会改变，即便这样关联，最后image中仍旧没有bucketId值
                        image.bucket = buckets[i];
                        image.rawName = file.name;
                        // 图片文件名为md5_时间戳
                        image.name = md5 + "_" + (+new Date());
                        image.type = type;
                        image.status = "post";
                        return [4 /*yield*/, this.restfulUtil.uploadFile(buckets[i], image, file, null)];
                    case 4:
                        _a = _c.sent(), width = _a.width, height = _a.height, frames_1 = _a.frames;
                        return [4 /*yield*/, this.restfulUtil.getFileInfo(buckets[i], image)];
                    case 5:
                        _b = _c.sent(), file_size = _b.file_size, file_md5 = _b.file_md5;
                        image.width = width;
                        image.height = height;
                        image.frames = frames_1;
                        image.size = file_size;
                        image.md5 = file_md5;
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.imageRepository.save(image)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_5 = _c.sent();
                        throw new common_1.HttpException("水印图片保存失败" + err_5.toString(), 403);
                    case 9:
                        _c.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.imageConfigRepository.updateById(buckets[i].imageConfig.id, {
                                watermark_save_key: "/" + buckets[i].directory + "/" + image.name + "." + image.type,
                                watermarkGravity: obj.gravity,
                                watermarkOpacity: obj.opacity,
                                watermarkWs: obj.ws,
                                watermarkX: obj.x,
                                watermarkY: obj.y
                            })];
                    case 10:
                        _c.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_6 = _c.sent();
                        throw new common_1.HttpException("水印配置更新失败" + err_6.toString(), 403);
                    case 12:
                        i++;
                        return [3 /*break*/, 3];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    ConfigService.prototype.saveAudioFormatConfig = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var format, buckets, i, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        format = body.format;
                        format = format.toLowerCase();
                        if (format !== "raw" && format !== "mp3" && format !== "aac") {
                            throw new common_1.HttpException("音频保存格式不正确", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.find({ relations: ["audio_config"] })];
                    case 1:
                        buckets = _a.sent();
                        if (buckets.length !== 2) {
                            throw new common_1.HttpException("空间配置不存在", 401);
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < buckets.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.audioConfigRepository.updateById(buckets[i].audioConfig.id, { format: format })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_7 = _a.sent();
                        throw new common_1.HttpException("音频保存格式更新失败" + err_7.toString(), 403);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ConfigService.prototype.saveVideoFormatConfig = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var format, resolution, buckets, i, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        format = body.format, resolution = body.resolution;
                        format = format.toLowerCase();
                        if (format !== "raw" && format !== "vp9" && format !== "h264" && format !== "h265") {
                            throw new common_1.HttpException("视频编码格式不正确", 400);
                        }
                        resolution = resolution.toLowerCase();
                        if (resolution !== "raw" && resolution !== "p1080" && resolution !== "p720" && resolution !== "p480") {
                            throw new common_1.HttpException("视频分辨率格式不正确", 400);
                        }
                        return [4 /*yield*/, this.bucketRepository.find({ relations: ["video_config"] })];
                    case 1:
                        buckets = _a.sent();
                        if (buckets.length !== 2) {
                            throw new common_1.HttpException("空间配置不存在", 401);
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < buckets.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.videoConfigRepository.updateById(buckets[i].videoConfig.id, { format: format, resolution: resolution })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_8 = _a.sent();
                        throw new common_1.HttpException("视频保存格式更新失败" + err_8.toString(), 403);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ConfigService = __decorate([
        common_1.Component(),
        __param(0, common_1.Inject(file_util_1.FileUtil)),
        __param(1, common_1.Inject(restful_util_1.RestfulUtil)),
        __param(2, typeorm_1.InjectRepository(image_entity_1.Image)),
        __param(3, typeorm_1.InjectRepository(bucket_entity_1.Bucket)),
        __param(4, typeorm_1.InjectRepository(image_config_entity_1.ImageConfig)),
        __param(5, typeorm_1.InjectRepository(audio_config_entity_1.AudioConfig)),
        __param(6, typeorm_1.InjectRepository(video_config_entity_1.VideoConfig))
    ], ConfigService);
    return ConfigService;
}());
exports.ConfigService = ConfigService;
