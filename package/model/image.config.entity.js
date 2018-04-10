"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var typeorm_1 = require("typeorm");
var bucket_entity_1 = require("./bucket.entity");
/* 图片配置实体类 */
var ImageConfig = /** @class */ (function () {
    function ImageConfig() {
    }
    __decorate([
        typeorm_1.PrimaryColumn({
            name: "id",
            type: "integer"
        })
    ], ImageConfig.prototype, "id");
    __decorate([
        typeorm_1.Column({
            name: "format",
            type: "varchar",
            undefinedable: true
        })
    ], ImageConfig.prototype, "format");
    __decorate([
        typeorm_1.Column({
            name: "watermarkEnable",
            type: "smallint",
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkEnable");
    __decorate([
        typeorm_1.Column({
            name: "watermarkSaveKey",
            type: "varchar",
            length: 80,
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkSaveKey");
    __decorate([
        typeorm_1.Column({
            name: "watermarkGravity",
            type: "varchar",
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkGravity");
    __decorate([
        typeorm_1.Column({
            name: "watermarkX",
            type: "integer",
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkX");
    __decorate([
        typeorm_1.Column({
            name: "watermarkY",
            type: "integer",
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkY");
    __decorate([
        typeorm_1.Column({
            name: "watermarkOpacity",
            type: "integer",
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkOpacity");
    __decorate([
        typeorm_1.Column({
            name: "watermarkWs",
            type: "integer",
            undefinedable: true
        })
    ], ImageConfig.prototype, "watermarkWs");
    __decorate([
        typeorm_1.OneToOne(function (type) { return bucket_entity_1.Bucket; }, function (bucket) { return bucket.imageConfig; }),
        typeorm_1.JoinColumn()
    ], ImageConfig.prototype, "bucket");
    ImageConfig = __decorate([
        typeorm_1.Entity({
            name: "imageConfig"
        })
    ], ImageConfig);
    return ImageConfig;
}());
exports.ImageConfig = ImageConfig;
