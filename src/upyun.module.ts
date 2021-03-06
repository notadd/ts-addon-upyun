import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileController } from "./controller/file.controller";
import { StoreComponentProvider } from "./export/store.component.provider";
import { ConfigResolver } from "./resolver/config.resolver";
import { FileResolver } from "./resolver/file.resolver";
import { Audio } from "./model/audio.entity";
import { AudioConfig } from "./model/audio.config.entity";
import { Bucket } from "./model/bucket.entity";
import { Document } from "./model/document.entity";
import { File } from "./model/file.entity";
import { Image } from "./model/image.entity";
import { ImageConfig } from "./model/image.config.entity";
import { Video } from "./model/video.entity";
import { VideoConfig } from "./model/video.config.entity";
import { ConfigService } from "./service/config.service";
import { FileService } from "./service/file.service";
import { AuthUtil } from "./util/auth.util";
import { FileUtil } from "./util/file.util";
import { KindUtil } from "./util/kind.util";
import { ProcessStringUtil } from "./util/process.string.util";
import { RestfulUtil } from "./util/restful.util";

@Global()
@Module({
    imports: [ TypeOrmModule.forFeature([ Bucket, AudioConfig, VideoConfig, ImageConfig, Document, Audio, Video, File, Image ]) ],
    controllers: [ FileController ],
    providers: [
        FileUtil, AuthUtil, KindUtil, RestfulUtil, ProcessStringUtil,
        ConfigService, FileService,
        ConfigResolver, FileResolver,
        StoreComponentProvider
    ],
    exports: [ StoreComponentProvider ]
})

export class UpyunModule {
}
