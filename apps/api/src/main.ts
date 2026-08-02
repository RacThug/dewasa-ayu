import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // Dev-friendly CORS; production locks this to the web origin (Slice 2 / deploy config).
  app.enableCors({ origin: true });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Dewasa Ayu API')
      .setDescription(
        'Wariga calendar conversion + per-ceremony dewasa evaluation. Dewasa verdicts are ' +
          'ESTIMATES (berdasarkan pedoman Wariga umum) — not a substitute for consulting a ' +
          'Sulinggih/Pemangku.',
      )
      .setVersion('1')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(openApiDoc));

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
