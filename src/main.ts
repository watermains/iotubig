import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API Key for External calls',
    })
    .addBearerAuth()
    .setTitle('IoTubig')
    .setDescription('Coolness overload')
    .setDescription('1.0')
    .addTag('UMPISA')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
