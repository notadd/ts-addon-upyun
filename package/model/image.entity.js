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
let Image = class Image extends abstract_file_1.AbstractFile {
};
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Image.prototype, "width", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Image.prototype, "height", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Image.prototype, "frames", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Image.prototype, "bucketId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => bucket_entity_1.Bucket, bucket => bucket.images, {
        cascade: false,
        nullable: false,
        lazy: false,
        eager: false
    }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", bucket_entity_1.Bucket)
], Image.prototype, "bucket", void 0);
Image = __decorate([
    typeorm_1.Entity("image")
], Image);
exports.Image = Image;

//# sourceMappingURL=image.entity.js.map
