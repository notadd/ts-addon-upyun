import { StoreComponentProvider } from './export/StoreComponentProvider';
import { ConfigResolver } from './graphql/resolver/ConfigResolver';
import { FileResolver } from './graphql/resolver/FileResolver';
import { FileController } from './controller/FileController';
import { ProcessStringUtil } from './util/ProcessStringUtil';
import { ConfigService } from './service/ConfigService';
import { FileService } from './service/FileService';
import { ImageConfig } from './model/ImageConfig';
import { AudioConfig } from './model/AudioConfig';
import { VideoConfig } from './model/VideoConfig';
import { RestfulUtil } from './util/RestfulUtil';
import { PromiseUtil } from './util/PromiseUtil';
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './model/Document';
import { KindUtil } from './util/KindUtil';
import { FileUtil } from './util/FileUtil';
import { AuthUtil } from './util/AuthUtil';
import { Bucket } from './model/Bucket';
import { Image } from './model/Image';
import { Audio } from './model/Audio';
import { Video } from './model/Video';
import { File } from './model/File';

@Global()
@Module({
  modules: [TypeOrmModule.forFeature([Bucket,AudioConfig,VideoConfig,ImageConfig,Document,Audio,Video,File,Image])],
  controllers: [FileController],
  components: [
    PromiseUtil, FileUtil, AuthUtil, KindUtil, RestfulUtil, ProcessStringUtil,
    ConfigService, FileService,
    ConfigResolver, FileResolver,
    StoreComponentProvider
  ],
  exports: [StoreComponentProvider]
})

export class UpyunModule { }
