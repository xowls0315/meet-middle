import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
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
    const exceptionResponse = exception.getResponse();

    // 명세서에 맞는 에러 응답 형식
    const errorResponse: { error: string; code?: string } = {
      error:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || exception.message,
      ...(typeof exceptionResponse === 'object' &&
      (exceptionResponse as any)?.error
        ? { code: (exceptionResponse as any).error }
        : {}),
    };

    response.status(status).json(errorResponse);
  }
}

