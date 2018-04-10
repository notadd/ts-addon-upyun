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
/* 音频配置实体类 */
var AudioConfig = /** @class */ (function () {
    function AudioConfig() {
    }
    __decorate([
        typeorm_1.PrimaryColumn({
            name: "id",
            type: "integer"
        })
    ], AudioConfig.prototype, "id");
    __decorate([
        typeorm_1.Column({
            name: "format",
            type: "varchar",
            nullable: true
        })
    ], AudioConfig.prototype, "format");
    __decorate([
        typeorm_1.OneToOne(function (type) { return bucket_entity_1.Bucket; }, function (bucket) { return bucket.audio_config; }),
        typeorm_1.JoinColumn()
    ], AudioConfig.prototype, "bucket");
    AudioConfig = __decorate([
        typeorm_1.Entity({
            name: "audio_config"
        })
    ], AudioConfig);
    return AudioConfig;
}());
exports.AudioConfig = AudioConfig;
