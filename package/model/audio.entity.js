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
const abstract_file_1 = require("./abstract.file");
const bucket_entity_1 = require("./bucket.entity");
let Audio = class Audio extends abstract_file_1.AbstractFile {
};
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Audio.prototype, "bucketId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => bucket_entity_1.Bucket, bucket => bucket.audios, {
        cascadeInsert: false,
        cascadeUpdate: false,
        cascadeRemove: false,
        nullable: false,
        lazy: false
    }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", bucket_entity_1.Bucket)
], Audio.prototype, "bucket", void 0);
Audio = __decorate([
    typeorm_1.Entity({
        name: "audio"
    })
], Audio);
exports.Audio = Audio;
