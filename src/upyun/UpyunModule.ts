import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './controller/FileController';
import { ConfigController } from './controller/ConfigController';
import { ConfigService } from './service/ConfigService';
import { FileService } from './service/FileService';
import { ProcessStringUtil } from './util/ProcessStringUtil';
import { RestfulUtil } from './util/RestfulUtil';
import { KindUtil } from './util/KindUtil';
import { AuthUtil } from './util/AuthUtil';
import { Document } from './model/Document'
import { ImageConfig } from './model/ImageConfig';
import { AudioConfig } from './model/AudioConfig';
import { VideoConfig } from './model/VideoConfig';
import { Bucket } from './model/Bucket';
import { Audio } from './model/Audio'
import { Video } from './model/Video'
import { Image } from './model/Image';
import { File} from './model/File'
const typeormOptions = require('./typeormConfig')


@Module({
  modules: [TypeOrmModule.forRoot([ImageConfig,AudioConfig,VideoConfig,Bucket,Image,File,Video,Audio,Document],typeormOptions)],  
  controllers: [ConfigController,FileController],
  components: [ConfigService,FileService,RestfulUtil,KindUtil,AuthUtil,ProcessStringUtil],
  exports:[ConfigService,FileService,RestfulUtil,AuthUtil,ProcessStringUtil]
})

export class UpyunModule {}
