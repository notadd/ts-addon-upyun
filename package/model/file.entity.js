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
let File = class File extends abstract_file_1.AbstractFile {
};
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], File.prototype, "bucketId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => bucket_entity_1.Bucket, bucket => bucket.files, {
        cascade: false,
        nullable: false,
        lazy: false,
        eager: false
    }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", bucket_entity_1.Bucket)
], File.prototype, "bucket", void 0);
File = __decorate([
    typeorm_1.Entity("file")
], File);
exports.File = File;

//# sourceMappingURL=file.entity.js.map
