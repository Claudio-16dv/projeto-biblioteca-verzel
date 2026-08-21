import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: origens liberadas via env CORS_ORIGIN (separadas por virgula).
  // Default: frontend em http://localhost:3000.
  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    // BIBL-5: o frontend le o nome do arquivo do CSV neste header.
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos nao declarados no DTO
      transform: true, // converte query params (sempre string) para o tipo do DTO
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
