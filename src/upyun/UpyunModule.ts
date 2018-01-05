import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageController } from './controller/ImageController';
import { ConfigController } from './controller/ConfigController';
import { ImageService } from './service/ImageService';
import { ConfigService } from './service/ConfigService';
import { RestfulService } from './service/RestfulService';
import { AuthUtil } from './util/AuthUtil';
import { ProcessStringUtil } from './util/ProcessStringUtil';
import { Config } from './model/Config';
import { Image } from './model/Image';
const typeormOptions = require('./typeormConfig')
@Module({
  modules: [TypeOrmModule.forRoot([Image,Config],typeormOptions)],  
  controllers: [ConfigController,ImageController],
  components: [ConfigService,ImageService,RestfulService,AuthUtil,ProcessStringUtil],
  exports:[ConfigService,ImageService,RestfulService,AuthUtil,ProcessStringUtil]
})

export class UpyunModule {}
