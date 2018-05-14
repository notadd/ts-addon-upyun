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
const crypto = require("crypto");
const typeorm_2 = require("typeorm");
const audio_config_entity_1 = require("../model/audio.config.entity");
const bucket_entity_1 = require("../model/bucket.entity");
const image_entity_1 = require("../model/image.entity");
const image_config_entity_1 = require("../model/image.config.entity");
const video_config_entity_1 = require("../model/video.config.entity");
const file_util_1 = require("../util/file.util");
const restful_util_1 = require("../util/restful.util");
let ConfigService = class ConfigService {
    constructor(fileUtil, restfulUtil, imageRepository, bucketRepository, imageConfigRepository, audioConfigRepository, videoConfigRepository) {
        this.fileUtil = fileUtil;
        this.restfulUtil = restfulUtil;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
        this.imageConfigRepository = imageConfigRepository;
        this.audioConfigRepository = audioConfigRepository;
        this.videoConfigRepository = videoConfigRepository;
    }
    saveBucketConfig(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = body.isPublic ? 1 : 2;
            const bucket = yield this.bucketRepository.findOne(id);
            if (bucket) {
                bucket.name = body.name;
                bucket.operator = body.operator;
                bucket.password = crypto.createHash("md5").update(body.password).digest("hex");
                bucket.directory = body.directory;
                bucket.baseUrl = body.baseUrl;
                bucket.requestExpire = body.requestExpire;
                if (!body.isPublic) {
                    bucket.tokenExpire = body.tokenExpire;
                    bucket.tokenSecretKey = body.tokenSecretKey;
                }
                try {
                    yield this.bucketRepository.save(bucket);
                }
                catch (err) {
                    throw new common_1.HttpException("空间配置更新失败" + err.toString(), 403);
                }
                return bucket;
            }
            else {
                const newBucket = this.bucketRepository.create({
                    id,
                    publicOrPrivate: body.isPublic ? "public" : "private",
                    name: body.name,
                    operator: body.operator,
                    password: crypto.createHash("md5").update(body.password).digest("hex"),
                    directory: body.directory,
                    baseUrl: body.baseUrl,
                    requestExpire: body.requestExpire
                });
                if (!body.isPublic) {
                    newBucket.tokenExpire = body.tokenExpire;
                    newBucket.tokenSecretKey = body.tokenSecretKey;
                }
                const audioConfig = new audio_config_entity_1.AudioConfig();
                const videoConfig = new video_config_entity_1.VideoConfig();
                const imageConfig = new image_config_entity_1.ImageConfig();
                audioConfig.id = id;
                videoConfig.id = id;
                imageConfig.id = id;
                newBucket.audioConfig = audioConfig;
                newBucket.videoConfig = videoConfig;
                newBucket.imageConfig = imageConfig;
                try {
                    yield this.bucketRepository.save(newBucket);
                }
                catch (err) {
                    throw new common_1.HttpException("空间保存失败" + err.toString(), 403);
                }
                return newBucket;
            }
        });
    }
    saveImageFormatConfig(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let { format } = body;
            format = format.toLowerCase();
            if (format !== "raw" && format !== "webp_damage" && format !== "webp_undamage") {
                throw new common_1.HttpException("图片保存格式不正确", 400);
            }
            const buckets = yield this.bucketRepository.find({ relations: ["imageConfig"] });
            if (buckets.length !== 2) {
                throw new common_1.HttpException("空间配置不存在", 401);
            }
            try {
                for (let i = 0; i < buckets.length; i++) {
                    buckets[i].imageConfig.format = format;
                    yield this.imageConfigRepository.save(buckets[i].imageConfig);
                }
            }
            catch (err) {
                throw new common_1.HttpException("图片保存格式更新失败" + err.toString(), 403);
            }
            return;
        });
    }
    saveEnableImageWatermarkConfig(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const buckets = yield this.bucketRepository.find({ relations: ["imageConfig"] });
            if (buckets.length !== 2) {
                throw new common_1.HttpException("空间配置不存在", 401);
            }
            let watermarkEnable;
            if (body.enable) {
                watermarkEnable = 1;
            }
            else {
                watermarkEnable = 0;
            }
            try {
                for (let i = 0; i < buckets.length; i++) {
                    buckets[i].imageConfig.watermarkEnable = watermarkEnable;
                    yield this.imageConfigRepository.save(buckets[i].imageConfig);
                }
            }
            catch (err) {
                throw new common_1.HttpException("水印启用保存失败" + err.toString(), 403);
            }
        });
    }
    saveImageWatermarkConfig(file, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const buckets = yield this.bucketRepository.find({ relations: ["imageConfig"] });
            let type = file.name.substr(file.name.lastIndexOf(".") + 1).toLowerCase();
            if (buckets.length !== 2) {
                throw new common_1.HttpException("空间配置不存在", 401);
            }
            const buffer = yield this.fileUtil.read(file.path);
            const md5 = crypto.createHash("md5").update(buffer).digest("hex");
            for (let i = 0; i < buckets.length; i++) {
                if (buckets[i].imageConfig.format === "webp_damage" || buckets[i].imageConfig.format === "webp_undamage") {
                    type = "webp";
                }
                const image = new image_entity_1.Image();
                image.bucket = buckets[i];
                image.rawName = file.name;
                image.name = md5 + "_" + (+new Date());
                image.type = type;
                image.md5 = md5;
                image.status = "post";
                const { width, height, frames } = yield this.restfulUtil.uploadFile(buckets[i], image, file, undefined);
                const { fileSize, fileMd5 } = yield this.restfulUtil.getFileInfo(buckets[i], image);
                image.width = width;
                image.height = height;
                image.frames = frames;
                image.size = fileSize;
                image.md5 = fileMd5;
                try {
                    yield this.imageRepository.save(image);
                }
                catch (err) {
                    throw new common_1.HttpException("水印图片保存失败" + err.toString(), 403);
                }
                try {
                    buckets[i].imageConfig.watermarkSaveKey = "/" + buckets[i].directory + "/" + image.name + "." + image.type;
                    buckets[i].imageConfig.watermarkGravity = obj.gravity;
                    buckets[i].imageConfig.watermarkOpacity = obj.opacity;
                    buckets[i].imageConfig.watermarkWs = obj.ws;
                    buckets[i].imageConfig.watermarkX = obj.x;
                    buckets[i].imageConfig.watermarkY = obj.y;
                    yield this.imageConfigRepository.save(buckets[i].imageConfig);
                }
                catch (err) {
                    throw new common_1.HttpException("水印配置更新失败" + err.toString(), 403);
                }
            }
            return;
        });
    }
    saveAudioFormatConfig(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let { format } = body;
            format = format.toLowerCase();
            if (format !== "raw" && format !== "mp3" && format !== "aac") {
                throw new common_1.HttpException("音频保存格式不正确", 400);
            }
            const buckets = yield this.bucketRepository.find({ relations: ["audioConfig"] });
            if (buckets.length !== 2) {
                throw new common_1.HttpException("空间配置不存在", 401);
            }
            try {
                for (let i = 0; i < buckets.length; i++) {
                    buckets[i].audioConfig.format = format;
                    yield this.audioConfigRepository.save(buckets[i].audioConfig);
                }
            }
            catch (err) {
                throw new common_1.HttpException("音频保存格式更新失败" + err.toString(), 403);
            }
        });
    }
    saveVideoFormatConfig(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let { format, resolution } = body;
            format = format.toLowerCase();
            if (format !== "raw" && format !== "vp9" && format !== "h264" && format !== "h265") {
                throw new common_1.HttpException("视频编码格式不正确", 400);
            }
            resolution = resolution.toLowerCase();
            if (resolution !== "raw" && resolution !== "p1080" && resolution !== "p720" && resolution !== "p480") {
                throw new common_1.HttpException("视频分辨率格式不正确", 400);
            }
            const buckets = yield this.bucketRepository.find({ relations: ["videoConfig"] });
            if (buckets.length !== 2) {
                throw new common_1.HttpException("空间配置不存在", 401);
            }
            try {
                for (let i = 0; i < buckets.length; i++) {
                    buckets[i].videoConfig.format = format;
                    buckets[i].videoConfig.resolution = resolution;
                    yield this.videoConfigRepository.save(buckets[i].videoConfig);
                }
            }
            catch (err) {
                throw new common_1.HttpException("视频保存格式更新失败" + err.toString(), 403);
            }
            return;
        });
    }
};
ConfigService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(file_util_1.FileUtil)),
    __param(1, common_1.Inject(restful_util_1.RestfulUtil)),
    __param(2, typeorm_1.InjectRepository(image_entity_1.Image)),
    __param(3, typeorm_1.InjectRepository(bucket_entity_1.Bucket)),
    __param(4, typeorm_1.InjectRepository(image_config_entity_1.ImageConfig)),
    __param(5, typeorm_1.InjectRepository(audio_config_entity_1.AudioConfig)),
    __param(6, typeorm_1.InjectRepository(video_config_entity_1.VideoConfig)),
    __metadata("design:paramtypes", [file_util_1.FileUtil,
        restful_util_1.RestfulUtil,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConfigService);
exports.ConfigService = ConfigService;

//# sourceMappingURL=config.service.js.map
