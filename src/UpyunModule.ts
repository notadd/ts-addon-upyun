import { RepositorysProvider } from './database/RepositorysProvider';
import { ConfigResolver } from './graphql/resolver/ConfigResolver';
import { ConnectionProvider } from './database/ConnectionProvider';
import { FileResolver } from './graphql/resolver/FileResolver';
import { FileController } from './controller/FileController';
import { ProcessStringUtil } from './util/ProcessStringUtil';
import { ConfigService } from './service/ConfigService';
import { FileService } from './service/FileService';
import { ImageConfig } from './model/ImageConfig';
import { AudioConfig } from './model/AudioConfig';
import { VideoConfig } from './model/VideoConfig';
import { RestfulUtil } from './util/RestfulUtil';
import { Document } from './model/Document';
import { KindUtil } from './util/KindUtil';
import { AuthUtil } from './util/AuthUtil';
import { Bucket } from './model/Bucket';
import { Module } from '@nestjs/common';
import { Image } from './model/Image';
import { Audio } from './model/Audio';
import { Video } from './model/Video';
import { File } from './model/File';


@Module({
  modules: [],
  controllers: [FileController],
  components: [ConnectionProvider,...RepositorysProvider,ConfigResolver, FileResolver, ConfigService, FileService, RestfulUtil, KindUtil, AuthUtil, ProcessStringUtil],
  exports: []
})

export class UpyunModule { }
