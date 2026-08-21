import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string;
  error: string;
};

/**
 * Padroniza o corpo de todo erro da API em { statusCode, message, error }.
 *
 * O ValidationPipe devolve `message` como array de strings, enquanto as
 * HttpException lancadas pelos services devolvem string. O frontend renderiza
 * `message` direto na tela, entao aqui o array e achatado em uma unica frase.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(body.message, (exception as Error)?.stack);
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno no servidor',
        error: 'Internal Server Error',
      };
    }

    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { statusCode, message: payload, error: exception.name };
    }

    const { message, error } = payload as {
      message?: string | string[];
      error?: string;
    };

    return {
      statusCode,
      message: Array.isArray(message)
        ? message.join('; ')
        : (message ?? exception.message),
      error: error ?? exception.name,
    };
  }
}
