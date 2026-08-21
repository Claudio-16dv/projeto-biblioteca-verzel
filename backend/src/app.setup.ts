import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Configuracao compartilhada entre o bootstrap e os testes e2e, para que os
 * testes exercitem exatamente o mesmo pipeline de validacao e de erro da API.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos nao declarados no DTO
      transform: true, // converte query params (sempre string) para o tipo do DTO
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
}
