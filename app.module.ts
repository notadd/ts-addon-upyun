import { Module } from '@nestjs/common';
import { UpyunModule } from './src/upyun/UpyunModule'
@Module({
  modules: [UpyunModule],
  controllers: [],
  components: []
})
export class ApplicationModule {}
