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
const allowExtension = require("../allowExtension.json");
let KindUtil = class KindUtil {
    constructor() {
    }
    getKind(type) {
        if (allowExtension.image.includes(type)) {
            return "image";
        }
        else if (allowExtension.audio.includes(type)) {
            return "audio";
        }
        else if (allowExtension.video.includes(type)) {
            return "video";
        }
        else if (allowExtension.document.includes(type)) {
            return "document";
        }
        else {
            return "file";
        }
    }
    isImage(type) {
        return allowExtension.image.includes(type);
    }
};
KindUtil = __decorate([
    common_1.Component(),
    __metadata("design:paramtypes", [])
], KindUtil);
exports.KindUtil = KindUtil;
