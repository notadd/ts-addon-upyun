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
const typeorm_1 = require("typeorm");
const audio_config_entity_1 = require("./audio.config.entity");
const audio_entity_1 = require("./audio.entity");
const document_entity_1 = require("./document.entity");
const file_entity_1 = require("./file.entity");
const image_config_entity_1 = require("./image.config.entity");
const image_entity_1 = require("./image.entity");
const video_config_entity_1 = require("./video.config.entity");
const video_entity_1 = require("./video.entity");
let Bucket = class Bucket {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], Bucket.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        length: 20,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "publicOrPrivate", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "operator", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({
        length: 20,
        nullable: false,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "directory", void 0);
__decorate([
    typeorm_1.Column({
        nullable: false,
    }),
    __metadata("design:type", Number)
], Bucket.prototype, "requestExpire", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "baseUrl", void 0);
__decorate([
    typeorm_1.Column({
        length: 250,
        nullable: true,
    }),
    __metadata("design:type", String)
], Bucket.prototype, "tokenSecretKey", void 0);
__decorate([
    typeorm_1.Column({
        nullable: true,
    }),
    __metadata("design:type", Number)
], Bucket.prototype, "tokenExpire", void 0);
__decorate([
    typeorm_1.OneToOne(type => image_config_entity_1.ImageConfig, imageConfig => imageConfig.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        lazy: false,
    }),
    __metadata("design:type", image_config_entity_1.ImageConfig)
], Bucket.prototype, "imageConfig", void 0);
__decorate([
    typeorm_1.OneToOne(type => audio_config_entity_1.AudioConfig, audioConfig => audioConfig.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        lazy: false,
    }),
    __metadata("design:type", audio_config_entity_1.AudioConfig)
], Bucket.prototype, "audioConfig", void 0);
__decorate([
    typeorm_1.OneToOne(type => video_config_entity_1.VideoConfig, videoConfig => videoConfig.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        lazy: false,
    }),
    __metadata("design:type", video_config_entity_1.VideoConfig)
], Bucket.prototype, "videoConfig", void 0);
__decorate([
    typeorm_1.OneToMany(type => file_entity_1.File, file => file.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], Bucket.prototype, "files", void 0);
__decorate([
    typeorm_1.OneToMany(type => image_entity_1.Image, image => image.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], Bucket.prototype, "images", void 0);
__decorate([
    typeorm_1.OneToMany(type => audio_entity_1.Audio, audio => audio.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], Bucket.prototype, "audios", void 0);
__decorate([
    typeorm_1.OneToMany(type => video_entity_1.Video, video => video.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], Bucket.prototype, "videos", void 0);
__decorate([
    typeorm_1.OneToMany(type => document_entity_1.Document, document => document.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], Bucket.prototype, "documents", void 0);
Bucket = __decorate([
    typeorm_1.Entity({
        name: "bucket",
    })
], Bucket);
exports.Bucket = Bucket;
