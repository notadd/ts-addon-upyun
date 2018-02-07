import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(ApplicationModule);
	await app.listen(3000);
}


bootstrap();
