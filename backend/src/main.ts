import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: origens liberadas via env CORS_ORIGIN (separadas por virgula).
  // Default: frontend em http://localhost:3000.
  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((o) =>
    o.trim(),
  ) ?? ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    // BIBL-5: o frontend le o nome do arquivo do CSV neste header.
    exposedHeaders: ['Content-Disposition'],
  });

  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
