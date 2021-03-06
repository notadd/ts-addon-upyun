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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const image_process_info_1 = require("../interface/file/image.process.info");
const kind_util_1 = require("./kind.util");
let ProcessStringUtil = class ProcessStringUtil {
    constructor(kindUtil) {
        this.kindUtil = kindUtil;
        this.gravity = new Set(["northwest", "north", "northeast", "west", "center", "east", "southwest", "south", "southeast"]);
    }
    makeImageProcessString(bucket, imageProcessInfo) {
        let processString = "";
        if (!imageProcessInfo || !bucket) {
            return processString;
        }
        if (imageProcessInfo.resize) {
            processString += this.resizeString(imageProcessInfo.resize);
        }
        if (imageProcessInfo.tailor) {
            processString += this.tailorString(imageProcessInfo.tailor);
        }
        processString += this.watermarkString(imageProcessInfo.watermark, bucket);
        if (imageProcessInfo.rotate) {
            processString += this.rotateString(imageProcessInfo.rotate);
        }
        if (imageProcessInfo instanceof image_process_info_1.ImagePostProcessInfo) {
            if (imageProcessInfo.blur) {
                processString += this.blurString(imageProcessInfo.blur);
            }
            if (imageProcessInfo.sharpen || imageProcessInfo.format || imageProcessInfo.lossless || imageProcessInfo.quality || imageProcessInfo.progressive || imageProcessInfo.strip) {
                processString += this.outputString(imageProcessInfo.sharpen, imageProcessInfo.format, imageProcessInfo.lossless, imageProcessInfo.quality, imageProcessInfo.progressive, imageProcessInfo.strip);
            }
        }
        return processString;
    }
    resizeString(resize) {
        if (!resize) {
            return "";
        }
        const mode = resize.mode;
        const info = resize.data;
        if (mode === "scale") {
            if (info.scale && Number.isInteger(info.scale) && info.scale >= 1 && info.scale <= 1000) {
                return "/scale/" + info.scale + "/force/true";
            }
            throw new common_1.HttpException("比例参数不正确", 405);
        }
        else if (mode === "wscale") {
            if (info.wscale && Number.isInteger(info.wscale) && info.wscale >= 1 && info.wscale <= 1000) {
                return "/wscale/" + info.wscale + "/force/true";
            }
            throw new common_1.HttpException("宽度比例参数不正确", 405);
        }
        else if (mode === "hscale") {
            if (info.hscale && Number.isInteger(info.hscale) && info.hscale >= 1 && info.hscale <= 1000) {
                return "/hscale/" + info.hscale + "/force/true";
            }
            throw new common_1.HttpException("高度比例参数不正确", 405);
        }
        else if (mode === "both") {
            if (info.width && Number.isInteger(info.width) && info.height && Number.isInteger(info.height)) {
                return "/both/" + info.width + "x" + info.height + "/force/true";
            }
            throw new common_1.HttpException("宽高参数不正确", 405);
        }
        else if (mode === "fw") {
            if (info.width && Number.isInteger(info.width)) {
                return "/fw/" + info.width + "/force/true";
            }
            throw new common_1.HttpException("宽度参数不正确", 405);
        }
        else if (mode === "fh") {
            if (info.height && Number.isInteger(info.height)) {
                return "/fh/" + info.height + "/force/true";
            }
            throw new common_1.HttpException("高度参数不正确", 405);
        }
        else if (mode === "fp") {
            if (info.pixel && Number.isInteger(info.pixel) && info.pixel >= 1 && info.pixel <= 25000000) {
                return "/fp/" + info.pixel + "/force/true";
            }
            throw new common_1.HttpException("像素参数不正确", 405);
        }
        else if (mode === "fwfh") {
            if (info.width && Number.isInteger(info.width) && info.height && Number.isInteger(info.height)) {
                return "/fwfh/" + info.width + "x" + info.height + "/force/true";
            }
            throw new common_1.HttpException("宽高参数不正确", 405);
        }
        else if (mode === "fwfh2") {
            if (info.width && Number.isInteger(info.width) && info.height && Number.isInteger(info.height)) {
                return "/fwfh2/" + info.width + "x" + info.height + "/force/true";
            }
            throw new common_1.HttpException("宽高参数不正确", 405);
        }
        else {
            throw new common_1.HttpException("缩放模式不正确", 405);
        }
    }
    tailorString(tailor) {
        if (!tailor) {
            return "";
        }
        const { isBefore, width, height, x, y, gravity } = tailor;
        let str = "";
        if (isBefore !== undefined && isBefore !== undefined && isBefore === true) {
            str += "/crop";
        }
        else if (isBefore !== undefined && isBefore !== undefined && isBefore === false) {
            str += "/clip";
        }
        else if (isBefore === undefined && isBefore === undefined) {
            str += "/clip";
        }
        else {
            throw new common_1.HttpException("裁剪顺序指定错误", 405);
        }
        if (width && Number.isInteger(width) && height && Number.isInteger(height) && x && Number.isInteger(x) && y && Number.isInteger(y)) {
            str += "/" + width + "x" + height;
        }
        else {
            throw new common_1.HttpException("裁剪宽高参数不正确", 405);
        }
        if (x && Number.isInteger(x) && x >= 0) {
            str += "a" + x;
        }
        else if (x && Number.isInteger(x) && x < 0) {
            str += "s" + x;
        }
        else {
            throw new common_1.HttpException("x参数不正确", 405);
        }
        if (y && Number.isInteger(y) && y >= 0) {
            str += "a" + y;
        }
        else if (y && Number.isInteger(y) && y < 0) {
            str += "s" + y;
        }
        else {
            throw new common_1.HttpException("y参数不正确", 405);
        }
        if (gravity && this.gravity.has(gravity)) {
            str += "/gravity/" + gravity;
        }
        else if (!gravity) {
            str += "/gravity/northwest";
        }
        else {
            throw new common_1.HttpException("裁剪重心参数不正确", 405);
        }
        return str;
    }
    watermarkString(watermark, bucket) {
        let enable;
        if (watermark === true) {
            enable = true;
        }
        else if (watermark === false) {
            enable = false;
        }
        else if (watermark === undefined || watermark === undefined) {
            if (bucket.imageConfig.watermarkEnable === 1) {
                enable = true;
            }
            else if (bucket.imageConfig.watermarkEnable === 0) {
                enable = false;
            }
            else {
                enable = false;
            }
        }
        else {
            throw new common_1.HttpException("水印参数不正确", 405);
        }
        let str = "";
        if (enable) {
            if (bucket.imageConfig.watermarkSaveKey) {
                str += "/watermark/url/" + Buffer.from(bucket.imageConfig.watermarkSaveKey).toString("base64");
            }
            else {
                throw new common_1.HttpException("水印图片url不存在", 405);
            }
            if (bucket.imageConfig.watermarkGravity && !this.gravity.has(bucket.imageConfig.watermarkGravity)) {
                throw new common_1.HttpException("水印重心参数不正确", 405);
            }
            else {
                str += "/align/" + bucket.imageConfig.watermarkGravity;
            }
            if ((bucket.imageConfig.watermarkX && !Number.isInteger(bucket.imageConfig.watermarkX)) || (bucket.imageConfig.watermarkY && !Number.isInteger(bucket.imageConfig.watermarkY))) {
                throw new common_1.HttpException("偏移参数不正确", 405);
            }
            else if (!bucket.imageConfig.watermarkX && !bucket.imageConfig.watermarkY) {
                str += "/margin/20x20";
            }
            else if (!bucket.imageConfig.watermarkX && bucket.imageConfig.watermarkY) {
                str += "/margin/20x" + bucket.imageConfig.watermarkY;
            }
            else if (bucket.imageConfig.watermarkX && !bucket.imageConfig.watermarkY) {
                str += "/margin/" + bucket.imageConfig.watermarkX + "x20";
            }
            else {
                str += "/margin/" + bucket.imageConfig.watermarkX + "x" + bucket.imageConfig.watermarkY;
            }
            if (bucket.imageConfig.watermarkOpacity && !Number.isInteger(bucket.imageConfig.watermarkOpacity)) {
                throw new common_1.HttpException("透明度参数不正确", 405);
            }
            else if (!bucket.imageConfig.watermarkOpacity) {
            }
            else {
                str += "/opacity/" + bucket.imageConfig.watermarkOpacity;
            }
            if (bucket.imageConfig.watermarkWs && Number.isInteger(bucket.imageConfig.watermarkWs) && bucket.imageConfig.watermarkWs >= 1 && bucket.imageConfig.watermarkWs <= 100) {
                str += "/percent/" + bucket.imageConfig.watermarkWs;
            }
            else if (!bucket.imageConfig.watermarkWs) {
            }
            else {
                throw new common_1.HttpException("短边自适应参数不正确", 405);
            }
        }
        return str;
    }
    rotateString(rotate) {
        if (!rotate) {
            return "";
        }
        if (Number.isInteger(rotate)) {
            return "/rotate/" + rotate;
        }
        else {
            throw new common_1.HttpException("旋转角度不正确", 405);
        }
    }
    blurString(blur) {
        if (!blur) {
            return "";
        }
        const { redius, sigma } = blur;
        if (!redius || !Number.isInteger(redius) || redius < 0 || redius > 50) {
            throw new common_1.HttpException("模糊半径不正确", 405);
        }
        if (!sigma || !Number.isInteger(sigma)) {
            throw new common_1.HttpException("标准差不正确", 405);
        }
        return "/gaussblur/" + redius + "x" + sigma;
    }
    outputString(sharpen, format, lossless, quality, progressive, strip) {
        let str = "";
        if (sharpen === true) {
            str += "/unsharp/true";
        }
        else if (sharpen) {
            throw new common_1.HttpException("锐化参数不正确", 405);
        }
        else {
        }
        if (format && this.kindUtil.isImage(format)) {
            str += "/format/" + format;
        }
        else if (format && !this.kindUtil.isImage(format)) {
            throw new common_1.HttpException("格式参数不正确", 405);
        }
        else {
        }
        if (lossless === true) {
            str += "/lossless/true";
        }
        else if (sharpen) {
            throw new common_1.HttpException("无损参数不正确", 405);
        }
        else {
        }
        if (quality && Number.isInteger(quality) && quality >= 1 && quality <= 99) {
            str += "/quality/" + quality;
        }
        else if (!quality) {
        }
        else {
            throw new common_1.HttpException("图片质量参数不正确", 405);
        }
        if (progressive === true) {
            str += "/progressive/true";
        }
        else if (progressive) {
            throw new common_1.HttpException("渐进参数不正确", 405);
        }
        else {
        }
        if (strip === true) {
            str += "/strip/true";
        }
        else if (strip) {
            throw new common_1.HttpException("去除元信息参数不正确", 405);
        }
        else {
        }
        return str;
    }
};
ProcessStringUtil = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(kind_util_1.KindUtil)),
    __metadata("design:paramtypes", [kind_util_1.KindUtil])
], ProcessStringUtil);
exports.ProcessStringUtil = ProcessStringUtil;

//# sourceMappingURL=process.string.util.js.map
