import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule,{
      bufferLogs: true
    });

  app.useLogger(
    app.get(
      WINSTON_MODULE_NEST_PROVIDER,
    ),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  app.useGlobalInterceptors(
    new TransformInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Backend Learning API')
    .setDescription('NestJS Learning API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  await app.listen(
  process.env.PORT ?? 3000,
);
}

bootstrap();
