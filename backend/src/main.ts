import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { BlockEmptyBodyPipe } from './common/pipes/block-empty-body.pipe.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(new BlockEmptyBodyPipe(),new ValidationPipe())
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
