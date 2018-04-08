import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './controller/FileController';
import { StoreComponentProvider } from './export/StoreComponentProvider';
import { ConfigResolver } from './graphql/resolver/ConfigResolver';
import { FileResolver } from './graphql/resolver/FileResolver';
import { Audio } from './model/Audio.entity';
import { AudioConfig } from './model/AudioConfig.entity';
import { Bucket } from './model/Bucket.entity';
import { Document } from './model/Document.entity';
import { File } from './model/File.entity';
import { Image } from './model/Image.entity';
import { ImageConfig } from './model/ImageConfig.entity';
import { Video } from './model/Video.entity';
import { VideoConfig } from './model/VideoConfig.entity';
import { ConfigService } from './service/ConfigService';
import { FileService } from './service/FileService';
import { AuthUtil } from './util/AuthUtil';
import { FileUtil } from './util/FileUtil';
import { KindUtil } from './util/KindUtil';
import { ProcessStringUtil } from './util/ProcessStringUtil';
import { PromiseUtil } from './util/PromiseUtil';
import { RestfulUtil } from './util/RestfulUtil';

@Global()
@Module({
    modules: [ TypeOrmModule.forFeature([ Bucket, AudioConfig, VideoConfig, ImageConfig, Document, Audio, Video, File, Image ]) ],
    controllers: [ FileController ],
    components: [
        PromiseUtil, FileUtil, AuthUtil, KindUtil, RestfulUtil, ProcessStringUtil,
        ConfigService, FileService,
        ConfigResolver, FileResolver,
        StoreComponentProvider
    ],
    exports: [ StoreComponentProvider ]
})

export class UpyunModule {
}
