"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var typeorm_1 = require("typeorm");
var audio_entity_1 = require("./audio.entity");
var audio_config_entity_1 = require("./audio.config.entity");
var document_entity_1 = require("./document.entity");
var file_entity_1 = require("./file.entity");
var image_entity_1 = require("./image.entity");
var image_config_entity_1 = require("./image.config.entity");
var video_entity_1 = require("./video.entity");
var video_config_entity_1 = require("./video.config.entity");
/* 后台配置实体类 */
var Bucket = /** @class */ (function () {
    function Bucket() {
    }
    __decorate([
        typeorm_1.PrimaryColumn({
            name: "id",
            type: "integer"
        })
    ], Bucket.prototype, "id");
    __decorate([
        typeorm_1.Column({
            name: "publicOrPrivate",
            type: "varchar",
            length: 20,
            nullable: false,
            unique: true
        })
    ], Bucket.prototype, "publicOrPrivate");
    __decorate([
        typeorm_1.Column({
            name: "name",
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true
        })
    ], Bucket.prototype, "name");
    __decorate([
        typeorm_1.Column({
            name: "operator",
            type: "varchar",
            length: 50,
            nullable: false
        })
    ], Bucket.prototype, "operator");
    __decorate([
        typeorm_1.Column({
            name: "password",
            type: "varchar",
            length: 50,
            nullable: false
        })
    ], Bucket.prototype, "password");
    __decorate([
        typeorm_1.Column({
            name: "directory",
            type: "varchar",
            length: 20,
            nullable: false
        })
    ], Bucket.prototype, "directory");
    __decorate([
        typeorm_1.Column({
            name: "requestExpire",
            type: "integer",
            nullable: false
        })
    ], Bucket.prototype, "requestExpire");
    __decorate([
        typeorm_1.Column({
            name: "baseUrl",
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true
        })
    ], Bucket.prototype, "baseUrl");
    __decorate([
        typeorm_1.Column({
            name: "tokenSecretKey",
            type: "varchar",
            length: 250,
            nullable: true
        })
    ], Bucket.prototype, "tokenSecretKey");
    __decorate([
        typeorm_1.Column({
            name: "tokenExpire",
            type: "integer",
            nullable: true
        })
    ], Bucket.prototype, "tokenExpire");
    __decorate([
        typeorm_1.OneToOne(function (type) { return image_config_entity_1.ImageConfig; }, function (imageConfig) { return imageConfig.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            cascadeRemove: true,
            lazy: false
        })
    ], Bucket.prototype, "imageConfig");
    __decorate([
        typeorm_1.OneToOne(function (type) { return audio_config_entity_1.AudioConfig; }, function (audioConfig) { return audioConfig.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            cascadeRemove: true,
            lazy: false
        })
    ], Bucket.prototype, "audioConfig");
    __decorate([
        typeorm_1.OneToOne(function (type) { return video_config_entity_1.VideoConfig; }, function (videoConfig) { return videoConfig.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            cascadeRemove: true,
            lazy: false
        })
    ], Bucket.prototype, "videoConfig");
    __decorate([
        typeorm_1.OneToMany(function (type) { return file_entity_1.File; }, function (file) { return file.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            lazy: true
        })
    ], Bucket.prototype, "files");
    __decorate([
        typeorm_1.OneToMany(function (type) { return image_entity_1.Image; }, function (image) { return image.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            lazy: true
        })
    ], Bucket.prototype, "images");
    __decorate([
        typeorm_1.OneToMany(function (type) { return audio_entity_1.Audio; }, function (audio) { return audio.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            lazy: true
        })
    ], Bucket.prototype, "audios");
    __decorate([
        typeorm_1.OneToMany(function (type) { return video_entity_1.Video; }, function (video) { return video.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            lazy: true
        })
    ], Bucket.prototype, "videos");
    __decorate([
        typeorm_1.OneToMany(function (type) { return document_entity_1.Document; }, function (document) { return document.bucket; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            lazy: true
        })
    ], Bucket.prototype, "documents");
    Bucket = __decorate([
        typeorm_1.Entity({
            name: "bucket"
        })
    ], Bucket);
    return Bucket;
}());
exports.Bucket = Bucket;
