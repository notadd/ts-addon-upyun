"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var common_1 = require("@nestjs/common");
/*错误码表
  200: 成功
  400：缺少参数或者参数不正确
  401：指定空间配置不存在
  402：restful请求错误
  403：数据库错误
  404：文件不存在
  405：图片处理错误
  406: 文件处理错误
  500：意外错误
*/
var UpyunExceptionFilter = /** @class */ (function () {
    function UpyunExceptionFilter() {
    }
    UpyunExceptionFilter.prototype["catch"] = function (exception, response) {
        var status = exception.getStatus();
        var message = exception.getResponse();
        response
            .status(status)
            .json({
            code: status,
            message: message
        });
    };
    UpyunExceptionFilter = __decorate([
        common_1.Catch(common_1.HttpException)
    ], UpyunExceptionFilter);
    return UpyunExceptionFilter;
}());
exports.UpyunExceptionFilter = UpyunExceptionFilter;
