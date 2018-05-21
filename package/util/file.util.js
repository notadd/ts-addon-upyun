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
let FileUtil = class FileUtil {
    constructor() { }
    write(path, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolver, reject) => {
                fs.writeFile(path, buffer, (err) => {
                    if (err) {
                        reject(new common_1.HttpException("文件写入磁盘错误:" + err.toString(), 406));
                        return;
                    }
                    resolver();
                    return;
                });
            });
        });
    }
    read(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield new Promise((resolver, reject) => {
                fs.readFile(path, (err, buffer) => {
                    if (err) {
                        reject(new common_1.HttpException("读取文件错误:" + err.toString(), 406));
                        return;
                    }
                    resolver(buffer);
                    return;
                });
            });
            return buffer;
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolver, reject) => {
                fs.unlink(path, (err) => {
                    if (err) {
                        reject(new common_1.HttpException("文件删除错误:" + err.toString(), 406));
                        return;
                    }
                    resolver();
                    return;
                });
            });
        });
    }
    deleteIfExist(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(path)) {
                yield new Promise((resolver, reject) => {
                    fs.unlink(path, (err) => {
                        if (err) {
                            reject(new common_1.HttpException("文件删除错误:" + err.toString(), 406));
                            return;
                        }
                        resolver();
                        return;
                    });
                });
            }
        });
    }
    size(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(path)) {
                const size = yield new Promise((resolver, reject) => {
                    fs.stat(path, (err, stats) => {
                        if (err) {
                            reject(new common_1.HttpException("获取文件状态错误:" + err.toString(), 406));
                            return;
                        }
                        resolver(stats.size);
                        return;
                    });
                });
                return size;
            }
            else {
                return undefined;
            }
        });
    }
    exist(path) {
        return fs.existsSync(path);
    }
    mkdir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolver, reject) => {
                fs.mkdir(path, (err) => {
                    if (err) {
                        reject(new common_1.HttpException("创建目录错误:" + err.toString(), 406));
                        return;
                    }
                    resolver();
                    return;
                });
            });
        });
    }
};
FileUtil = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], FileUtil);
exports.FileUtil = FileUtil;

//# sourceMappingURL=file.util.js.map
