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
var audio_entity_1 = require("../model/audio.entity");
var bucket_entity_1 = require("../model/bucket.entity");
var file_entity_1 = require("../model/file.entity");
var image_entity_1 = require("../model/image.entity");
var video_entity_1 = require("../model/video.entity");
var auth_util_1 = require("../util/auth.util");
var kind_util_1 = require("../util/kind.util");
var process_string_util_1 = require("../util/process.string.util");
var restful_util_1 = require("../util/restful.util");
/* 图片服务组件，包含了上传时创建policy对象、预保存图片
   回调通知时，后保存、后删除
   查找图片、创建访问图片的url等功能
*/
var FileService = /** @class */ (function () {
    function FileService(authUtil, kindUtil, restfulUtil, processStringUtil, fileRepository, imageRepository, audioRepository, videoRepository, bucketRepository) {
        this.authUtil = authUtil;
        this.kindUtil = kindUtil;
        this.restfulUtil = restfulUtil;
        this.processStringUtil = processStringUtil;
        this.fileRepository = fileRepository;
        this.imageRepository = imageRepository;
        this.audioRepository = audioRepository;
        this.videoRepository = videoRepository;
        this.bucketRepository = bucketRepository;
    }
    FileService.prototype.makePolicy = function (data, policy, bucket, body, file) {
        return __awaiter(this, void 0, void 0, function () {
            var md5, contentSecret, contentName, type, kind, obj, format, method, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        md5 = body.md5, contentSecret = body.contentSecret, contentName = body.contentName;
                        //设置各种上传参数
                        if (contentSecret) {
                            policy["content-secret"] = contentSecret;
                        }
                        policy["bucket"] = bucket.name;
                        policy["ext-param"] += bucket.name;
                        data["url"] += "/" + bucket.name;
                        type = file.type || "";
                        kind = this.kindUtil.getKind(type);
                        //这里原图的save_key不保存它，在回调中直接删除
                        policy["save-key"] += "/" + bucket.directory + "/" + md5 + "_" + (+new Date()) + "." + type;
                        policy["expiration"] = Math.floor((+new Date()) / 1000) + bucket.requestExpire;
                        policy["date"] = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        //根据配置，设置预处理参数，只有一个预处理任务
                        if (kind === "image") {
                            obj = {
                                "name": "thumb",
                                "x-gmkerl-thumb": "",
                                "save_as": "",
                                "notify_url": policy["notify-url"]
                            };
                            format = bucket.imageConfig.format || "raw";
                            //原图不处理
                            if (format == "raw") {
                                //保存为原图，为了防止没有预处理字符串时不进行预处理任务，加上了/scale/100
                                obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/scale/100";
                                //这里将预处理的文件名设置为刚才保存的文件名，在回调中根据文件名来更新它，保存为原图时，
                                obj["save_as"] = "/" + bucket.directory + "/" + file.name + "." + file.type;
                                //apps字段应为json字符串
                                policy["apps"] = [obj];
                            }
                            else if (format == "webp_damage") {
                                //保存为有损webp
                                obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/format/webp/strip/true";
                                obj["save_as"] = "/" + bucket.directory + "/" + file.name + "." + "webp";
                                //apps字段应为json字符串
                                policy["apps"] = [obj];
                            }
                            else if (format == "webp_undamage") {
                                //保存为无损webp
                                obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/format/webp/lossless/true/strip/true";
                                obj["save_as"] = "/" + bucket.directory + "/" + file.name + "." + "webp";
                                policy["apps"] = [obj];
                            }
                            else {
                                throw new Error("格式配置不正确，应该不能发生");
                            }
                        }
                        else {
                            //暂时不支持
                        }
                        //设置表单policy字段
                        data.form.policy = Buffer.from(JSON.stringify(policy)).toString("base64");
                        method = data.method;
                        _a = data.form;
                        return [4 /*yield*/, this.authUtil.getBodyAuth(bucket, method, policy)];
                    case 1:
                        _a.authorization = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FileService.prototype.preSaveFile = function (bucket, body) {
        return __awaiter(this, void 0, void 0, function () {
            var md5, contentName, contentSecret, tags, type, kind, image, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        md5 = body.md5, contentName = body.contentName, contentSecret = body.contentSecret, tags = body.tags;
                        type = contentName.substr(contentName.lastIndexOf(".") + 1).toLowerCase();
                        kind = this.kindUtil.getKind(type);
                        if (!(kind === "image")) return [3 /*break*/, 5];
                        image = new image_entity_1.Image();
                        image.rawName = contentName;
                        //这个文件名会设置到预处理参数apps的save_as中去，而不是上传参数的save_key中，那个文件名不保存，在回调中直接删除
                        image.name = md5 + "_" + (+new Date());
                        image.md5 = md5;
                        image.tags = tags;
                        image.type = type;
                        image.status = "pre";
                        image.contentSecret = contentSecret || null;
                        image.bucket = bucket;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.imageRepository.save(image)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw new common_1.HttpException("图片预保存失败", 403);
                    case 4: return [2 /*return*/, image];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /* 预处理回调通知验签成功，且响应码为200时，后保存图片 */
    FileService.prototype.postSaveTask = function (bucket, name, body, kind) {
        return __awaiter(this, void 0, void 0, function () {
            var image, _a, file_size, file_md5, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(kind === "image")) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.imageRepository.findOne({ name: name, bucketId: bucket.id, status: "pre" })
                            //预保存图片不存在时，正常返回，服务器错误
                        ];
                    case 1:
                        image = _b.sent();
                        //预保存图片不存在时，正常返回，服务器错误
                        if (!image) {
                            return [2 /*return*/];
                        }
                        image.width = body.imginfo["width"],
                            image.height = body.imginfo["height"],
                            image.type = body.imginfo["type"].toLowerCase(),
                            image.frames = body.imginfo["frames"],
                            image.status = "post";
                        return [4 /*yield*/, this.restfulUtil.getFileInfo(bucket, image)];
                    case 2:
                        _a = _b.sent(), file_size = _a.file_size, file_md5 = _a.file_md5;
                        image.size = file_size;
                        image.md5 = file_md5;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.imageRepository.updateById(image.id, image)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _b.sent();
                        throw new common_1.HttpException("更新预保存图片失败", 403);
                    case 6: return [3 /*break*/, 8];
                    case 7: throw new Error("kind不正确");
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    //创建url
    FileService.prototype.makeUrl = function (bucket, file, body, kind) {
        return __awaiter(this, void 0, void 0, function () {
            var url, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = "/" + bucket.directory + "/" + file.name + "." + file.type;
                        url += "!";
                        if (file.contentSecret) {
                            url += file.contentSecret;
                        }
                        if (kind === "image") {
                            //拼接处理字符串，使用请求体参数
                            url += this.processStringUtil.makeImageProcessString(bucket, body.imagePostProcessInfo);
                        }
                        if (!(bucket.publicOrPrivate == "private")) return [3 /*break*/, 2];
                        _a = url;
                        _b = "?_upt=";
                        return [4 /*yield*/, this.authUtil.getToken(bucket, url)];
                    case 1:
                        url = _a + (_b + (_c.sent()));
                        _c.label = 2;
                    case 2:
                        url = bucket.baseUrl.concat(url);
                        return [2 /*return*/, url];
                }
            });
        });
    };
    FileService.prototype.getAll = function (data, bucket) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, addUrl;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = data;
                        return [4 /*yield*/, bucket.files];
                    case 1:
                        _a.files = _f.sent();
                        _b = data;
                        return [4 /*yield*/, bucket.images];
                    case 2:
                        _b.images = _f.sent();
                        _c = data;
                        return [4 /*yield*/, bucket.audios];
                    case 3:
                        _c.audios = _f.sent();
                        _d = data;
                        return [4 /*yield*/, bucket.videos];
                    case 4:
                        _d.videos = _f.sent();
                        _e = data;
                        return [4 /*yield*/, bucket.documents];
                    case 5:
                        _e.documents = _f.sent();
                        addUrl = function (value) {
                            return __awaiter(this, void 0, void 0, function () {
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            value.url = "/" + bucket.directory + "/" + value.name + "." + value.type;
                                            if (value.contentSecret) {
                                                value.url += "!" + value.contentSecret;
                                            }
                                            if (!(bucket.publicOrPrivate === "private")) return [3 /*break*/, 2];
                                            _a = value;
                                            _b = _a.url;
                                            _c = "?_upt=";
                                            return [4 /*yield*/, this.authUtil.getToken(bucket, value.url)];
                                        case 1:
                                            _a.url = _b + (_c + (_d.sent()));
                                            _d.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return [4 /*yield*/, data.files.forEach(addUrl, this)];
                    case 6:
                        _f.sent();
                        return [4 /*yield*/, data.images.forEach(addUrl, this)];
                    case 7:
                        _f.sent();
                        return [4 /*yield*/, data.audios.forEach(addUrl, this)];
                    case 8:
                        _f.sent();
                        return [4 /*yield*/, data.videos.forEach(addUrl, this)];
                    case 9:
                        _f.sent();
                        return [4 /*yield*/, data.documents.forEach(addUrl, this)];
                    case 10:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FileService = __decorate([
        common_1.Component(),
        __param(0, common_1.Inject(auth_util_1.AuthUtil)),
        __param(1, common_1.Inject(kind_util_1.KindUtil)),
        __param(2, common_1.Inject(restful_util_1.RestfulUtil)),
        __param(3, common_1.Inject(process_string_util_1.ProcessStringUtil)),
        __param(4, typeorm_1.InjectRepository(file_entity_1.File)),
        __param(5, typeorm_1.InjectRepository(image_entity_1.Image)),
        __param(6, typeorm_1.InjectRepository(audio_entity_1.Audio)),
        __param(7, typeorm_1.InjectRepository(video_entity_1.Video)),
        __param(8, typeorm_1.InjectRepository(bucket_entity_1.Bucket))
    ], FileService);
    return FileService;
}());
exports.FileService = FileService;
