import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './controller/FileController';
import { ConfigController } from './controller/ConfigController';
import { FileService } from './service/FileService';
import { ConfigService } from './service/ConfigService';
import { RestfulUtil } from './util/RestfulUtil';
import { AuthUtil } from './util/AuthUtil';
import { ProcessStringUtil } from './util/ProcessStringUtil';
import { Directory } from './model/Directory';
import { Bucket } from './model/Bucket';
import { Image } from './model/Image';
const typeormOptions = require('./typeormConfig')
@Module({
  modules: [TypeOrmModule.forRoot([Image,Bucket,Directory],typeormOptions)],  
  controllers: [ConfigController,FileController],
  components: [ConfigService,FileService,RestfulUtil,AuthUtil,ProcessStringUtil],
  exports:[ConfigService,FileService,RestfulUtil,AuthUtil,ProcessStringUtil]
})

export class UpyunModule {}
