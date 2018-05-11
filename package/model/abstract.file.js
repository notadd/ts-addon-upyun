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
class AbstractFile {
}
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], AbstractFile.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false
    }),
    __metadata("design:type", String)
], AbstractFile.prototype, "rawName", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false,
        unique: true
    }),
    __metadata("design:type", String)
], AbstractFile.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        nullable: true,
        type: "simple-array"
    }),
    __metadata("design:type", Array)
], AbstractFile.prototype, "tags", void 0);
__decorate([
    typeorm_1.Column({
        length: 50,
        nullable: false
    }),
    __metadata("design:type", String)
], AbstractFile.prototype, "md5", void 0);
__decorate([
    typeorm_1.Column({
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], AbstractFile.prototype, "type", void 0);
__decorate([
    typeorm_1.Column({
        nullable: true
    }),
    __metadata("design:type", Number)
], AbstractFile.prototype, "size", void 0);
__decorate([
    typeorm_1.Column({
        length: "50",
        nullable: true
    }),
    __metadata("design:type", String)
], AbstractFile.prototype, "contentSecret", void 0);
__decorate([
    typeorm_1.Column({
        nullable: false
    }),
    __metadata("design:type", String)
], AbstractFile.prototype, "status", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], AbstractFile.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], AbstractFile.prototype, "updateDate", void 0);
exports.AbstractFile = AbstractFile;

//# sourceMappingURL=abstract.file.js.map
