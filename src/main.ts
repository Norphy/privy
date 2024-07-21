import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OgmaService } from '@ogma/nestjs-module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get<OgmaService>(OgmaService);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
