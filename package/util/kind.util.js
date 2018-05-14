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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const allow_extension_1 = require("./allow.extension");
let KindUtil = class KindUtil {
    constructor() { }
    getKind(type) {
        if (allow_extension_1.default.image.find(item => type === item)) {
            return "image";
        }
        else if (allow_extension_1.default.audio.find(item => type === item)) {
            return "audio";
        }
        else if (allow_extension_1.default.video.find(item => type === item)) {
            return "video";
        }
        else if (allow_extension_1.default.document.find(item => type === item)) {
            return "document";
        }
        else {
            return "file";
        }
    }
    isImage(type) {
        return allow_extension_1.default.image.find(item => type === item);
    }
};
KindUtil = __decorate([
    common_1.Component(),
    __metadata("design:paramtypes", [])
], KindUtil);
exports.KindUtil = KindUtil;

//# sourceMappingURL=kind.util.js.map
