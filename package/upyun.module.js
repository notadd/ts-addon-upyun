"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var file_controller_1 = require("./controller/file.controller");
var store_component_provider_1 = require("./export/store.component.provider");
var config_resolver_1 = require("./graphql/resolver/config.resolver");
var file_resolver_1 = require("./graphql/resolver/file.resolver");
var audio_entity_1 = require("./model/audio.entity");
var audio_config_entity_1 = require("./model/audio.config.entity");
var bucket_entity_1 = require("./model/bucket.entity");
var document_entity_1 = require("./model/document.entity");
var file_entity_1 = require("./model/file.entity");
var image_entity_1 = require("./model/image.entity");
var image_config_entity_1 = require("./model/image.config.entity");
var video_entity_1 = require("./model/video.entity");
var video_config_entity_1 = require("./model/video.config.entity");
var config_service_1 = require("./service/config.service");
var file_service_1 = require("./service/file.service");
var auth_util_1 = require("./util/auth.util");
var file_util_1 = require("./util/file.util");
var kind_util_1 = require("./util/kind.util");
var process_string_util_1 = require("./util/process.string.util");
var promise_util_1 = require("./util/promise.util");
var restful_util_1 = require("./util/restful.util");
var UpyunModule = /** @class */ (function () {
    function UpyunModule() {
    }
    UpyunModule = __decorate([
        common_1.Global(),
        common_1.Module({
            modules: [typeorm_1.TypeOrmModule.forFeature([bucket_entity_1.Bucket, audio_config_entity_1.AudioConfig, video_config_entity_1.VideoConfig, image_config_entity_1.ImageConfig, document_entity_1.Document, audio_entity_1.Audio, video_entity_1.Video, file_entity_1.File, image_entity_1.Image])],
            controllers: [file_controller_1.FileController],
            components: [
                promise_util_1.PromiseUtil, file_util_1.FileUtil, auth_util_1.AuthUtil, kind_util_1.KindUtil, restful_util_1.RestfulUtil, process_string_util_1.ProcessStringUtil,
                config_service_1.ConfigService, file_service_1.FileService,
                config_resolver_1.ConfigResolver, file_resolver_1.FileResolver,
                store_component_provider_1.StoreComponentProvider
            ],
            exports: [store_component_provider_1.StoreComponentProvider]
        })
    ], UpyunModule);
    return UpyunModule;
}());
exports.UpyunModule = UpyunModule;
