import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    const bodyObj =
      typeof body === 'string'
        ? { message: body }
        : (body as Record<string, unknown>);

    const rawMessage = bodyObj.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : ((rawMessage as string) ?? exception.message);

    response.status(status).json({
      statusCode: status,
      message,
      error: (bodyObj.error as string) ?? HttpStatus[status] ?? 'Error',
    });
  }
}
