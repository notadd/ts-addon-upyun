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
const fs = require("fs");
const mime = require("mime");
const request = require("request");
const auth_util_1 = require("../util/auth.util");
const process_string_util_1 = require("./process.string.util");
const promise_util_1 = require("./promise.util");
let RestfulUtil = class RestfulUtil {
    constructor(authUtil, promiseUtil, processStringUtil) {
        this.authUtil = authUtil;
        this.promiseUtil = promiseUtil;
        this.processStringUtil = processStringUtil;
        this.apihost = "https://v0.api.upyun.com";
    }
    uploadFile(bucket, file, uploadFile, imagePreProcessInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const contentMd5 = file.md5;
            const saveKey = "/" + bucket.directory + "/" + file.name + "." + file.type;
            const requestUrl = this.apihost + "/" + bucket.name + saveKey;
            const url = "/" + bucket.name + saveKey;
            const date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            const Authorization = yield this.authUtil.getHeaderAuth(bucket, "PUT", url, date, contentMd5);
            const format = bucket.imageConfig.format || "raw";
            let xGmkerlThumb = this.processStringUtil.makeImageProcessString(bucket, imagePreProcessInfo);
            if (format === "raw") {
                xGmkerlThumb += "/scale/100";
            }
            else if (format === "webp_damage") {
                xGmkerlThumb += "/format/webp/strip/true";
            }
            else {
                xGmkerlThumb += "/format/webp/lossless/true/strip/true";
            }
            let height, width, frames;
            yield this.promiseUtil.do((resolve, reject) => {
                fs.createReadStream(uploadFile.path).pipe(request.put({
                    url: requestUrl,
                    headers: {
                        "Content-Type": mime.getType(uploadFile.path),
                        "Content-MD5": contentMd5,
                        Authorization,
                        "Date": date,
                        "x-gmkerl-thumb": xGmkerlThumb
                    }
                }, (err, res, body) => {
                    if (err) {
                        reject(new common_1.HttpException("文件上传失败,网络错误", 402));
                        return;
                    }
                    if (res.statusCode === 200) {
                        width = res.headers["x-upyun-width"];
                        height = res.headers["x-upyun-height"];
                        frames = res.headers["x-upyun-frames"];
                        resolve();
                        return;
                    }
                    if (body) {
                        try {
                            const { msg, code, id } = JSON.parse(body);
                            reject(new common_1.HttpException(msg, code));
                        }
                        catch (err) {
                            reject(new common_1.HttpException("响应体解析错误", 402));
                        }
                    }
                    else {
                        reject(new common_1.HttpException("响应体不存在", 402));
                    }
                    return;
                }));
            });
            return { width, height, frames };
        });
    }
    createDirectory(bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = this.apihost + "/" + bucket.name + "/" + bucket.directory;
            const url = "/" + bucket.name + "/" + bucket.directory;
            const date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            const Authorization = yield this.authUtil.getHeaderAuth(bucket, "POST", url, date, undefined);
            console.log(Authorization);
            yield this.promiseUtil.do((resolve, reject) => {
                request.post({
                    url: requestUrl,
                    headers: {
                        Authorization,
                        Date: date,
                        folder: true
                    }
                }, (err, res, body) => {
                    if (err) {
                        reject(new common_1.HttpException("目录创建失败，网络错误", 402));
                        return;
                    }
                    if (res.statusCode === 200) {
                        resolve();
                        return;
                    }
                    if (body) {
                        try {
                            const { msg, code, id } = JSON.parse(body);
                            console.log(body);
                            reject(new common_1.HttpException(msg, code));
                        }
                        catch (err) {
                            reject(new common_1.HttpException("响应体解析错误", 402));
                        }
                    }
                    else {
                        reject(new common_1.HttpException("响应体不存在", 402));
                    }
                    return;
                });
            });
            return;
        });
    }
    deleteFile(bucket, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const savekey = "/" + bucket.directory + "/" + file.name + "." + file.type;
            const requestUrl = this.apihost + "/" + bucket.name + savekey;
            const url = "/" + bucket.name + savekey;
            const date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            const Authorization = yield this.authUtil.getHeaderAuth(bucket, "DELETE", url, date, "");
            yield this.promiseUtil.do((resolve, reject) => {
                request.delete({
                    url: requestUrl,
                    headers: {
                        Authorization,
                        Date: date
                    }
                }, (err, res, body) => {
                    if (err) {
                        reject(new common_1.HttpException("删除文件失败", 402));
                        return;
                    }
                    if (res.statusCode === 200) {
                        resolve();
                        return;
                    }
                    if (body) {
                        try {
                            const { msg, code, id } = JSON.parse(body);
                            reject(new common_1.HttpException(msg, code));
                        }
                        catch (err) {
                            reject(new common_1.HttpException("响应体解析错误", 402));
                        }
                    }
                    else {
                        reject(new common_1.HttpException("响应体不存在", 402));
                    }
                    return;
                });
            });
            return;
        });
    }
    getFileInfo(bucket, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const savekey = "/" + bucket.directory + "/" + file.name + "." + file.type;
            const requestUrl = this.apihost + "/" + bucket.name + savekey;
            const url = "/" + bucket.name + savekey;
            const date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            const Authorization = yield this.authUtil.getHeaderAuth(bucket, "HEAD", url, date, "");
            let fileSize, fileDate, fileMd5;
            yield this.promiseUtil.do((resolve, reject) => {
                request.head({
                    url: requestUrl,
                    headers: {
                        Authorization,
                        Date: date
                    }
                }, (err, res, body) => {
                    if (err) {
                        reject(new common_1.HttpException("获取文件信息失败", 402));
                        return;
                    }
                    if (res.statusCode === 200) {
                        fileSize = +res.headers["x-upyun-file-size"];
                        fileDate = +res.headers["x-upyun-file-date"];
                        fileMd5 = res.headers["content-md5"];
                        resolve();
                        return;
                    }
                    if (body) {
                        try {
                            const { msg, code, id } = JSON.parse(body);
                            reject(new common_1.HttpException(msg, code));
                        }
                        catch (err) {
                            reject(new common_1.HttpException("响应体解析错误", 402));
                        }
                    }
                    else {
                        reject(new common_1.HttpException("响应体不存在", 402));
                    }
                    return;
                });
            });
            return { fileSize, fileDate, fileMd5 };
        });
    }
    getFileList(bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            const saveKey = "/" + bucket.directory;
            const requestUrl = this.apihost + "/" + bucket.name + saveKey;
            const url = "/" + bucket.name + saveKey;
            const date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
            const Authorization = yield this.authUtil.getHeaderAuth(bucket, "GET", url, date, "");
            let info;
            yield this.promiseUtil.do((resolve, reject) => {
                request.get({
                    url: requestUrl,
                    headers: {
                        Authorization,
                        Date: date
                    }
                }, (err, res, body) => {
                    if (err) {
                        reject(new common_1.HttpException("获取文件信息失败", 402));
                        return;
                    }
                    if (res.statusCode === 200) {
                        info = body.split("\n").map((value, index, raw) => {
                            const temp = value.split("\t");
                            return {
                                name: temp[0],
                                isDirectory: (temp[1] === "N" ? false : true),
                                size: parseInt(temp[2]),
                                timestamp: parseInt(temp[3])
                            };
                        });
                        resolve();
                        return;
                    }
                    reject(new common_1.HttpException("获取文件列表失败", 402));
                    return;
                });
            });
            return info;
        });
    }
};
RestfulUtil = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(auth_util_1.AuthUtil)),
    __param(1, common_1.Inject(promise_util_1.PromiseUtil)),
    __param(2, common_1.Inject(process_string_util_1.ProcessStringUtil)),
    __metadata("design:paramtypes", [auth_util_1.AuthUtil,
        promise_util_1.PromiseUtil,
        process_string_util_1.ProcessStringUtil])
], RestfulUtil);
exports.RestfulUtil = RestfulUtil;

//# sourceMappingURL=restful.util.js.map
