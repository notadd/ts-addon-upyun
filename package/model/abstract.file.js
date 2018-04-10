"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var typeorm_1 = require("typeorm");
var AbstractFile = /** @class */ (function () {
    function AbstractFile() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn({
            name: "id",
            type: "integer"
        })
    ], AbstractFile.prototype, "id");
    __decorate([
        typeorm_1.Column({
            name: "rawName",
            type: "varchar",
            length: 50,
            nullable: false
        })
    ], AbstractFile.prototype, "rawName");
    __decorate([
        typeorm_1.Column({
            name: "name",
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true
        })
    ], AbstractFile.prototype, "name");
    __decorate([
        typeorm_1.Column({
            name: "tags",
            type: "simple-array",
            nullable: true
        })
    ], AbstractFile.prototype, "tags");
    __decorate([
        typeorm_1.Column({
            name: "md5",
            type: "varchar",
            length: 50,
            nullable: false
        })
    ], AbstractFile.prototype, "md5");
    __decorate([
        typeorm_1.Column({
            name: "type",
            type: "varchar",
            length: 20,
            // File可以没有扩展名
            nullable: true
        })
    ], AbstractFile.prototype, "type");
    __decorate([
        typeorm_1.Column({
            name: "size",
            type: "integer",
            nullable: true
        })
    ], AbstractFile.prototype, "size");
    __decorate([
        typeorm_1.Column({
            name: "contentSecret",
            type: "varchar",
            length: "50",
            nullable: true
        })
    ], AbstractFile.prototype, "contentSecret");
    __decorate([
        typeorm_1.Column({
            name: "status",
            type: "varchar",
            nullable: false
        })
    ], AbstractFile.prototype, "status");
    __decorate([
        typeorm_1.CreateDateColumn({
            name: "createDate",
            type: "date"
        })
    ], AbstractFile.prototype, "createDate");
    __decorate([
        typeorm_1.UpdateDateColumn({
            name: "updateDate",
            type: "date"
        })
    ], AbstractFile.prototype, "updateDate");
    return AbstractFile;
}());
exports.AbstractFile = AbstractFile;
