"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var crypto = require("crypto");
/* 验证签名服务组件，包含获取头信息签名、请求体签名、token、回调通知验签等功能 */
var AuthUtil = /** @class */ (function () {
    function AuthUtil() {
    }
    /* 获取请求头信息中签名，restfulAPI与form回调通知签名使用这种签名方式
      @Param data：响应信息
      @Param bucket：空间配置
      @Param url：请求url，即不包含域名、查询字符串之前的部分，对于回调通知为/image/notify
      @Param date：加上超时之后的GMT格式字符串
      @Param method：请求方法，回调通知为异步时为post
      @Param contentMd5：请求体md5值
    */
    AuthUtil.prototype.getHeaderAuth = function (bucket, method, url, date, md5) {
        return __awaiter(this, void 0, void 0, function () {
            var ori, signTemp;
            return __generator(this, function (_a) {
                ori = "";
                ori += method.toUpperCase() + "&";
                ori += url + "&";
                ori += date;
                if (md5 && md5 !== "") {
                    ori += "&" + md5;
                }
                signTemp = crypto.createHmac("sha1", bucket.password).update(ori).digest().toString("base64");
                return [2 /*return*/, "UPYUN " + bucket.operator + ":" + signTemp];
            });
        });
    };
    /* 获取请求体信息签名，form表单上传采用这种签名方式
       @Param data：响应信息
       @Param bucket：空间配置
       @Param method：请求方法
       @Param policy：上传参数对象
    */
    AuthUtil.prototype.getBodyAuth = function (bucket, method, policy) {
        return __awaiter(this, void 0, void 0, function () {
            var ori, signTemp;
            return __generator(this, function (_a) {
                ori = "";
                ori += method.toUpperCase() + "&";
                ori += "/" + policy["bucket"] + "&";
                ori += policy.date + "&";
                //拼接上传参数json字符串的base64编码
                ori += Buffer.from(JSON.stringify(policy)).toString("base64");
                if (policy["content-md5"] && policy["content-md5"] !== "") {
                    ori += "&" + policy["content-md5"];
                }
                signTemp = crypto.createHmac("sha1", bucket.password).update(ori).digest("base64");
                return [2 /*return*/, "UPYUN " + bucket.operator + ":" + signTemp];
            });
        });
    };
    /* 获取访问私有空间图片token
       @Param url：访问图片的url,不包含域名
       @Param bucket：空间配置
    */
    AuthUtil.prototype.getToken = function (bucket, url) {
        return __awaiter(this, void 0, void 0, function () {
            var expireTime, str, md5, middle8;
            return __generator(this, function (_a) {
                expireTime = Math.floor((+new Date()) / 1000) + bucket.tokenExpire;
                str = bucket.tokenSecretKey + "&" + expireTime + "&" + url;
                md5 = crypto.createHash("md5").update(str).digest("hex");
                middle8 = md5.substring(12, 20);
                return [2 /*return*/, middle8 + expireTime];
            });
        });
    };
    /* 验证回调签名
       @Param auth：回调响应头信息中签名字符串
       @Param bucket：空间配置
       @Param url：回调通知url
       @Param method：回调通知方法，异步情况下问post
       @Param body：回调通知请求体对象
       @Param date：回调请求头信息中date字符串
       @Param contentMd5：回调请求头信息中md5值
    */
    AuthUtil.prototype.notifyVerify = function (auth, bucket, method, url, date, contentMd5, body) {
        return __awaiter(this, void 0, void 0, function () {
            var rawBody, keys, genarateMd5, ori, localSign, remoteSign;
            return __generator(this, function (_a) {
                rawBody = "";
                keys = Object.keys(body);
                keys.forEach(function (key, index) {
                    if (body[key] && !isNaN(parseInt(body[key])) && key !== "task_ids") {
                        body[key] = parseInt(body[key]);
                    }
                    rawBody += key + "=" + encodeURIComponent(body[key]);
                    if (index < keys.length - 1) {
                        rawBody += "&";
                    }
                });
                genarateMd5 = crypto.createHash("md5").update(rawBody).digest("hex");
                if (genarateMd5 !== contentMd5) {
                    return [2 /*return*/, false];
                }
                ori = "";
                ori += method.toUpperCase() + "&";
                ori += url + "&";
                ori += date + "&";
                ori += contentMd5;
                localSign = crypto.createHmac("sha1", bucket.password).update(ori).digest("base64");
                remoteSign = auth.substr(auth.lastIndexOf(":") + 1);
                if (localSign === remoteSign) {
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    /* 验证回调签名
       @Param auth：回调响应头信息中签名字符串
       @Param bucket：空间配置
       @Param url：回调通知url
       @Param method：回调通知方法，异步情况下问post
       @Param body：回调通知请求体对象
    */
    AuthUtil.prototype.taskNotifyVerify = function (auth, bucket, method, url, date, contentMd5, body) {
        return __awaiter(this, void 0, void 0, function () {
            var genarateMd5, ori, localSign, remoteSign;
            return __generator(this, function (_a) {
                genarateMd5 = crypto.createHash("md5").update(JSON.stringify(body)).digest("hex");
                if (contentMd5 !== genarateMd5) {
                    return [2 /*return*/, false];
                }
                ori = "";
                ori += method.toUpperCase() + "&";
                ori += url + "&";
                ori += date + "&";
                ori += contentMd5;
                localSign = crypto.createHmac("sha1", bucket.password).update(ori).digest("base64");
                remoteSign = auth.substr(auth.lastIndexOf(":") + 1);
                if (localSign === remoteSign) {
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    AuthUtil = __decorate([
        common_1.Component()
    ], AuthUtil);
    return AuthUtil;
}());
exports.AuthUtil = AuthUtil;
