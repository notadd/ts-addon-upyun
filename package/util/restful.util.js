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
var fs = require("fs");
var mime = require("mime");
var request = require("request");
var auth_util_1 = require("../util/auth.util");
var process_string_util_1 = require("./process.string.util");
var promise_util_1 = require("./promise.util");
/* 包含了restfulAPI的各种功能
   删除文件、创建目录、删除目录、获取文件信息、获取目录文件列表、获取服务使用量
*/
var RestfulUtil = /** @class */ (function () {
    function RestfulUtil(authUtil, promiseUtil, processStringUtil) {
        this.authUtil = authUtil;
        this.promiseUtil = promiseUtil;
        this.processStringUtil = processStringUtil;
        this.apihost = "https://v0.api.upyun.com";
    }
    //上传文件，其中文件信息来自于formidable解析得到的File对象
    RestfulUtil.prototype.uploadFile = function (bucket, file, uploadFile, imagePreProcessInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var contentMd5, save_key, requestUrl, url, date, Authorization, format, x_gmkerl_thumb, height, width, frames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentMd5 = file.md5;
                        save_key = "/" + bucket.directory + "/" + file.name + "." + file.type;
                        requestUrl = this.apihost + "/" + bucket.name + save_key;
                        url = "/" + bucket.name + save_key;
                        date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        return [4 /*yield*/, this.authUtil.getHeaderAuth(bucket, "PUT", url, date, contentMd5)];
                    case 1:
                        Authorization = _a.sent();
                        format = bucket.imageConfig.format || "raw";
                        x_gmkerl_thumb = this.processStringUtil.makeImageProcessString(bucket, imagePreProcessInfo);
                        if (format === "raw") {
                            x_gmkerl_thumb += "/scale/100";
                        }
                        else if (format === "webp_damage") {
                            x_gmkerl_thumb += "/format/webp/strip/true";
                        }
                        else {
                            x_gmkerl_thumb += "/format/webp/lossless/true/strip/true";
                        }
                        return [4 /*yield*/, this.promiseUtil["do"](function (resolve, reject) {
                                fs.createReadStream(uploadFile.path).pipe(request.put({
                                    url: requestUrl,
                                    headers: {
                                        "Content-Type": mime.getType(file.name),
                                        "Content-Length": file.size,
                                        "Content-MD5": contentMd5,
                                        Authorization: Authorization,
                                        Date: date,
                                        "x-gmkerl-thumb": x_gmkerl_thumb
                                    }
                                }, function (err, res, body) {
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
                                            var _a = JSON.parse(body), msg = _a.msg, code = _a.code, id = _a.id;
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
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { width: width, height: height, frames: frames }];
                }
            });
        });
    };
    /*创建指定空间里的指定目录，空间下唯一目录在配置中指定
        @Param bucket：目录所属空间
    */
    RestfulUtil.prototype.createDirectory = function (bucket) {
        return __awaiter(this, void 0, void 0, function () {
            var requestUrl, url, date, Authorization;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestUrl = this.apihost + "/" + bucket.name + "/" + bucket.directory;
                        url = "/" + bucket.name + "/" + bucket.directory;
                        date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        return [4 /*yield*/, this.authUtil.getHeaderAuth(bucket, "POST", url, date, null)];
                    case 1:
                        Authorization = _a.sent();
                        return [4 /*yield*/, this.promiseUtil["do"](function (resolve, reject) {
                                request.post({
                                    url: requestUrl,
                                    headers: {
                                        Authorization: Authorization,
                                        Date: date,
                                        folder: true
                                    }
                                }, function (err, res, body) {
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
                                            var _a = JSON.parse(body), msg = _a.msg, code = _a.code, id = _a.id;
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
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* 删除指定空间指定文件
       @Param bucket：文件所属空间
       @Param file：文件对象
     */
    RestfulUtil.prototype.deleteFile = function (bucket, file) {
        return __awaiter(this, void 0, void 0, function () {
            var save_key, requestUrl, url, date, Authorization;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        save_key = "/" + bucket.directory + "/" + file.name + "." + file.type;
                        requestUrl = this.apihost + "/" + bucket.name + save_key;
                        url = "/" + bucket.name + save_key;
                        date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        return [4 /*yield*/, this.authUtil.getHeaderAuth(bucket, "DELETE", url, date, "")];
                    case 1:
                        Authorization = _a.sent();
                        return [4 /*yield*/, this.promiseUtil["do"](function (resolve, reject) {
                                request["delete"]({
                                    url: requestUrl,
                                    headers: {
                                        Authorization: Authorization,
                                        Date: date
                                    }
                                }, function (err, res, body) {
                                    if (err) {
                                        reject(new common_1.HttpException("删除文件失败", 402));
                                        return;
                                    }
                                    if (res.statusCode == 200) {
                                        resolve();
                                        return;
                                    }
                                    if (body) {
                                        try {
                                            var _a = JSON.parse(body), msg = _a.msg, code = _a.code, id = _a.id;
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
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* 获取指定文件的保存信息
     */
    RestfulUtil.prototype.getFileInfo = function (bucket, file) {
        return __awaiter(this, void 0, void 0, function () {
            var save_key, requestUrl, url, date, Authorization, file_size, file_date, file_md5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        save_key = "/" + bucket.directory + "/" + file.name + "." + file.type;
                        requestUrl = this.apihost + "/" + bucket.name + save_key;
                        url = "/" + bucket.name + save_key;
                        date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        return [4 /*yield*/, this.authUtil.getHeaderAuth(bucket, "HEAD", url, date, "")];
                    case 1:
                        Authorization = _a.sent();
                        return [4 /*yield*/, this.promiseUtil["do"](function (resolve, reject) {
                                request.head({
                                    url: requestUrl,
                                    headers: {
                                        Authorization: Authorization,
                                        Date: date
                                    }
                                }, function (err, res, body) {
                                    if (err) {
                                        reject(new common_1.HttpException("获取文件信息失败", 402));
                                        return;
                                    }
                                    if (res.statusCode == 200) {
                                        file_size = +res.headers["x-upyun-file-size"];
                                        file_date = +res.headers["x-upyun-file-date"];
                                        file_md5 = res.headers["content-md5"];
                                        resolve();
                                        return;
                                    }
                                    if (body) {
                                        try {
                                            var _a = JSON.parse(body), msg = _a.msg, code = _a.code, id = _a.id;
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
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { file_size: file_size, file_date: file_date, file_md5: file_md5 }];
                }
            });
        });
    };
    /* 获取指定空间下文件\目录列表
       响应头信息中指明了分页位置
       响应体为换行符、空格拼接的字符串，列分别为
       文件名/目录名  类型(N表示文件、F标志目录) 大小 最后修改时间
     */
    RestfulUtil.prototype.getFileList = function (bucket) {
        return __awaiter(this, void 0, void 0, function () {
            var save_key, requestUrl, url, date, Authorization, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        save_key = "/" + bucket.directory;
                        requestUrl = this.apihost + "/" + bucket.name + save_key;
                        url = "/" + bucket.name + save_key;
                        date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
                        return [4 /*yield*/, this.authUtil.getHeaderAuth(bucket, "GET", url, date, "")];
                    case 1:
                        Authorization = _a.sent();
                        return [4 /*yield*/, this.promiseUtil["do"](function (resolve, reject) {
                                request.get({
                                    url: requestUrl,
                                    headers: {
                                        Authorization: Authorization,
                                        Date: date
                                    }
                                }, function (err, res, body) {
                                    if (err) {
                                        reject(new common_1.HttpException("获取文件信息失败", 402));
                                        return;
                                    }
                                    if (res.statusCode == 200) {
                                        info = body.split("\n").map(function (value, index, raw) {
                                            var temp = value.split("\t");
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
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, info];
                }
            });
        });
    };
    RestfulUtil = __decorate([
        common_1.Component(),
        __param(0, common_1.Inject(auth_util_1.AuthUtil)),
        __param(1, common_1.Inject(promise_util_1.PromiseUtil)),
        __param(2, common_1.Inject(process_string_util_1.ProcessStringUtil))
    ], RestfulUtil);
    return RestfulUtil;
}());
exports.RestfulUtil = RestfulUtil;
