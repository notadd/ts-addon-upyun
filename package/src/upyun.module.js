"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const file_controller_1 = require("./controller/file.controller");
const store_component_provider_1 = require("./export/store.component.provider");
const config_resolver_1 = require("./graphql/resolver/config.resolver");
const file_resolver_1 = require("./graphql/resolver/file.resolver");
const audio_entity_1 = require("./model/audio.entity");
const audio_config_entity_1 = require("./model/audio.config.entity");
const bucket_entity_1 = require("./model/bucket.entity");
const document_entity_1 = require("./model/document.entity");
const file_entity_1 = require("./model/file.entity");
const image_entity_1 = require("./model/image.entity");
const image_config_entity_1 = require("./model/image.config.entity");
const video_entity_1 = require("./model/video.entity");
const video_config_entity_1 = require("./model/video.config.entity");
const config_service_1 = require("./service/config.service");
const file_service_1 = require("./service/file.service");
const auth_util_1 = require("./util/auth.util");
const file_util_1 = require("./util/file.util");
const kind_util_1 = require("./util/kind.util");
const process_string_util_1 = require("./util/process.string.util");
const promise_util_1 = require("./util/promise.util");
const restful_util_1 = require("./util/restful.util");
let UpyunModule = class UpyunModule {
};
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
exports.UpyunModule = UpyunModule;
