import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import * as pjson from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API Key for External calls',
    }, 'External-Calls').addApiKey({
      type: 'apiKey',
      name: 'x-callback-token',
      in: 'header',
      description: 'API Key for Xendit calls',
    }, 'Xendit-Calls')
    .addBearerAuth()
    .setTitle('IoTubig')
    .setDescription('Coolness overload')
    .setDescription(`${pjson.version}`)
    .addTag('UMPISA')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
