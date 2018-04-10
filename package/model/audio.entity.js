"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var typeorm_1 = require("typeorm");
var abstract_file_1 = require("./abstract.file");
var bucket_entity_1 = require("./bucket.entity");
var Audio = /** @class */ (function (_super) {
    __extends(Audio, _super);
    function Audio() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], Audio.prototype, "bucketId");
    __decorate([
        typeorm_1.ManyToOne(function (type) { return bucket_entity_1.Bucket; }, function (bucket) { return bucket.audios; }, {
            cascadeInsert: false,
            cascadeUpdate: false,
            cascadeRemove: false,
            nullable: false,
            lazy: false
        }),
        typeorm_1.JoinColumn()
    ], Audio.prototype, "bucket");
    Audio = __decorate([
        typeorm_1.Entity({
            name: "audio"
        })
    ], Audio);
    return Audio;
}(abstract_file_1.AbstractFile));
exports.Audio = Audio;
