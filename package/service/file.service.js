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
const typeorm_2 = require("typeorm");
const audio_entity_1 = require("../model/audio.entity");
const bucket_entity_1 = require("../model/bucket.entity");
const file_entity_1 = require("../model/file.entity");
const image_entity_1 = require("../model/image.entity");
const video_entity_1 = require("../model/video.entity");
const auth_util_1 = require("../util/auth.util");
const kind_util_1 = require("../util/kind.util");
const process_string_util_1 = require("../util/process.string.util");
const restful_util_1 = require("../util/restful.util");
let FileService = class FileService {
    constructor(authUtil, kindUtil, restfulUtil, processStringUtil, fileRepository, imageRepository, audioRepository, videoRepository, bucketRepository) {
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
    makePolicy(data, policy, bucket, body, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const { md5, contentSecret, contentName } = body;
            if (contentSecret) {
                policy["content-secret"] = contentSecret;
            }
            policy.bucket = bucket.name;
            policy["ext-param"] += bucket.name;
            data.url += "/" + bucket.name;
            const type = file.type || "";
            const kind = this.kindUtil.getKind(type);
            policy["save-key"] += "/" + bucket.directory + "/" + md5 + "_" + (+new Date()) + "." + type;
            policy.expiration = Math.floor((+new Date()) / 1000) + bucket.requestExpire;
            policy.date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            if (kind === "image") {
                const obj = {
                    "name": "thumb",
                    "x-gmkerl-thumb": "",
                    "save_as": "",
                    "notify_url": policy["notify-url"]
                };
                const format = bucket.imageConfig.format || "raw";
                if (format === "raw") {
                    obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/scale/100";
                    obj.save_as = "/" + bucket.directory + "/" + file.name + "." + file.type;
                    policy.apps = [obj];
                }
                else if (format === "webp_damage") {
                    obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/format/webp/strip/true";
                    obj.save_as = "/" + bucket.directory + "/" + file.name + "." + "webp";
                    policy.apps = [obj];
                }
                else if (format === "webp_undamage") {
                    obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/format/webp/lossless/true/strip/true";
                    obj.save_as = "/" + bucket.directory + "/" + file.name + "." + "webp";
                    policy.apps = [obj];
                }
                else {
                    throw new Error("格式配置不正确，应该不能发生");
                }
            }
            else {
            }
            data.form.policy = Buffer.from(JSON.stringify(policy)).toString("base64");
            const method = data.method;
            data.form.authorization = yield this.authUtil.getBodyAuth(bucket, method, policy);
            return;
        });
    }
    preSaveFile(bucket, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { md5, contentName, contentSecret, tags } = body;
            const type = contentName.substr(contentName.lastIndexOf(".") + 1).toLowerCase();
            const kind = this.kindUtil.getKind(type);
            if (kind === "image") {
                const image = new image_entity_1.Image();
                image.rawName = contentName;
                image.name = md5 + "_" + (+new Date());
                image.md5 = md5;
                image.tags = tags;
                image.type = type;
                image.status = "pre";
                image.contentSecret = contentSecret || undefined;
                image.bucket = bucket;
                try {
                    yield this.imageRepository.save(image);
                }
                catch (err) {
                    throw new common_1.HttpException("图片预保存失败", 403);
                }
                return image;
            }
            else {
            }
        });
    }
    postSaveTask(bucket, name, body, kind) {
        return __awaiter(this, void 0, void 0, function* () {
            if (kind === "image") {
                const image = yield this.imageRepository.findOne({ name, bucketId: bucket.id, status: "pre" });
                if (!image) {
                    return;
                }
                image.width = body.imginfo.width,
                    image.height = body.imginfo.height,
                    image.type = body.imginfo.type.toLowerCase(),
                    image.frames = body.imginfo.frames,
                    image.status = "post";
                const { fileSize, fileMd5 } = yield this.restfulUtil.getFileInfo(bucket, image);
                image.size = fileSize;
                image.md5 = fileMd5;
                try {
                    yield this.imageRepository.updateById(image.id, image);
                }
                catch (err) {
                    throw new common_1.HttpException("更新预保存图片失败", 403);
                }
            }
            else {
                throw new Error("kind不正确");
            }
            return;
        });
    }
    makeUrl(bucket, file, body, kind) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = "/" + bucket.directory + "/" + file.name + "." + file.type;
            url += "!";
            if (file.contentSecret) {
                url += file.contentSecret;
            }
            if (kind === "image") {
                url += this.processStringUtil.makeImageProcessString(bucket, body.imagePostProcessInfo);
            }
            if (bucket.publicOrPrivate === "private") {
                url += "?_upt=" + (yield this.authUtil.getToken(bucket, url));
            }
            url = bucket.baseUrl.concat(url);
            return url;
        });
    }
    getAll(data, bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            data.files = yield bucket.files;
            data.images = yield bucket.images;
            data.audios = yield bucket.audios;
            data.videos = yield bucket.videos;
            data.documents = yield bucket.documents;
            const addUrl = function (value) {
                return __awaiter(this, void 0, void 0, function* () {
                    value.url = "/" + bucket.directory + "/" + value.name + "." + value.type;
                    if (value.contentSecret) {
                        value.url += "!" + value.contentSecret;
                    }
                    if (bucket.publicOrPrivate === "private") {
                        value.url += "?_upt=" + (yield this.authUtil.getToken(bucket, value.url));
                    }
                });
            };
            yield data.files.forEach(addUrl, this);
            yield data.images.forEach(addUrl, this);
            yield data.audios.forEach(addUrl, this);
            yield data.videos.forEach(addUrl, this);
            yield data.documents.forEach(addUrl, this);
        });
    }
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
    __param(8, typeorm_1.InjectRepository(bucket_entity_1.Bucket)),
    __metadata("design:paramtypes", [auth_util_1.AuthUtil,
        kind_util_1.KindUtil,
        restful_util_1.RestfulUtil,
        process_string_util_1.ProcessStringUtil,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FileService);
exports.FileService = FileService;
