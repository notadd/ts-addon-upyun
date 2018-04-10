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
var path = require("path");
var upyun_exception_filter_1 = require("../exception/upyun.exception.filter");
var bucket_entity_1 = require("../model/bucket.entity");
var file_entity_1 = require("../model/file.entity");
var image_entity_1 = require("../model/image.entity");
var file_service_1 = require("../service/file.service");
var auth_util_1 = require("../util/auth.util");
var kind_util_1 = require("../util/kind.util");
var restful_util_1 = require("../util/restful.util");
/*文件控制器、异步回调通知
*/
var FileController = /** @class */ (function () {
    function FileController(authUtil, kindUtil, restfulUtil, fileService, fileRepository, imageRepository, bucketRepository) {
        this.authUtil = authUtil;
        this.kindUtil = kindUtil;
        this.restfulUtil = restfulUtil;
        this.fileService = fileService;
        this.fileRepository = fileRepository;
        this.imageRepository = imageRepository;
        this.bucketRepository = bucketRepository;
    }
    /* 异步回调通知接口，接受两种请求，默认所有文件都会进行预处理，所有每个上传请求会接收到两个回调请求，一个是原图的，一个是预处理结果
       application/x-www-form-urlencoded：即原图的上传回调，包含了原图的保存信息，其中没有空间名，需要从ext-param中获取空间名，原图文件名并未在数据库中保存，直接删除即可
       application/json：                 异步预处理上传回调 ，根据文件名更新数据库
    */
    FileController.prototype.asyncNotify = function (body, req, headers, res) {
        return __awaiter(this, void 0, void 0, function () {
            var contentType, contentMd5, auth, date, code, name_1, type, kind, bucketName, bucket, pass, image, code, bucketName, name_2, type, kind, bucket, pass;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentType = headers["content-type"];
                        contentMd5 = headers["content-md5"];
                        auth = headers.authorization;
                        date = headers.date;
                        console.log(body);
                        if (!(contentType === "application/x-www-form-urlencoded")) return [3 /*break*/, 5];
                        code = +body.code;
                        // 上传不成功时，要返回200,提示云存储不再发送回调请求
                        if (code !== 200) {
                            throw new common_1.HttpException("上传失败,返回200告诉又拍云不要再发送回调信息", 200);
                        }
                        name_1 = path.parse(body.url).name;
                        type = path.parse(body.url).ext.substr(1);
                        kind = this.kindUtil.getKind(type);
                        bucketName = body["ext-param"];
                        return [4 /*yield*/, this.bucketRepository.findOne({ name: bucketName })];
                    case 1:
                        bucket = _a.sent();
                        if (!bucket) {
                            throw new common_1.HttpException("空间不存在，说明是内部错误,返回200告诉又拍云不要再发送回调信息", 200);
                        }
                        return [4 /*yield*/, this.authUtil.notifyVerify(auth, bucket, "POST", "/upyun/file/notify", date, contentMd5, body)];
                    case 2:
                        pass = _a.sent();
                        // 验签不成功，要返回400,提示云存储继续发送回调请求
                        if (!pass) {
                            throw new common_1.HttpException("验签失败,返回400告诉又拍云继续发送回调信息", 400);
                        }
                        if (!(kind === "image")) return [3 /*break*/, 4];
                        image = new image_entity_1.Image();
                        image.name = name_1;
                        image.type = type;
                        return [4 /*yield*/, this.restfulUtil.deleteFile(bucket, image)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 9];
                    case 5:
                        if (!(contentType === "application/json")) return [3 /*break*/, 9];
                        code = body.status_code;
                        // 预处理不成功时，要返回200,提示云存储不再发送回调请求
                        if (code !== 200) {
                            throw new common_1.HttpException("预处理失败,返回200告诉又拍云不要再发送回调信息", 200);
                        }
                        bucketName = body.bucket_name;
                        name_2 = path.parse(body.imginfo.path).name;
                        type = path.parse(body.imginfo.path).ext.substr(1);
                        kind = this.kindUtil.getKind(type);
                        return [4 /*yield*/, this.bucketRepository.findOne({ name: bucketName })];
                    case 6:
                        bucket = _a.sent();
                        return [4 /*yield*/, this.authUtil.taskNotifyVerify(auth, bucket, "POST", "/upyun/file/notify", date, contentMd5, body)];
                    case 7:
                        pass = _a.sent();
                        // 验签不成功，要返回400,提示云存储继续发送回调请求
                        if (!pass) {
                            throw new common_1.HttpException("验签失败,返回400告诉又拍云继续发送回调信息", 400);
                        }
                        return [4 /*yield*/, this.fileService.postSaveTask(bucket, name_2, body, kind)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        res.sendStatus(200);
                        res.end();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        common_1.Post("notify"),
        __param(0, common_1.Body()), __param(1, common_1.Request()), __param(2, common_1.Headers()), __param(3, common_1.Response())
    ], FileController.prototype, "asyncNotify");
    FileController = __decorate([
        common_1.Controller("upyun/file"),
        common_1.UseFilters(new upyun_exception_filter_1.UpyunExceptionFilter()),
        __param(0, common_1.Inject(auth_util_1.AuthUtil)),
        __param(1, common_1.Inject(kind_util_1.KindUtil)),
        __param(2, common_1.Inject(restful_util_1.RestfulUtil)),
        __param(3, common_1.Inject(file_service_1.FileService)),
        __param(4, typeorm_1.InjectRepository(file_entity_1.File)),
        __param(5, typeorm_1.InjectRepository(image_entity_1.Image)),
        __param(6, typeorm_1.InjectRepository(bucket_entity_1.Bucket))
    ], FileController);
    return FileController;
}());
exports.FileController = FileController;
