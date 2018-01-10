import { Module } from '@nestjs/common';
import { UpyunModule } from './src/upyun/UpyunModule'
import { TestController } from './test/TestController'
@Module({
  modules: [UpyunModule],
  controllers: [TestController],
  components: []
})


export class ApplicationModule {}
