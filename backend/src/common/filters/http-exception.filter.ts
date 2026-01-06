import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || exception.message;

      if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any)?.error
      ) {
        errorCode = (exceptionResponse as any).error;
      }
    } else {
      // 예상치 못한 에러 로깅
      this.logger.error('Unexpected error:', exception);
      
      // 에러 메시지가 있으면 사용, 없으면 기본 메시지
      if (exception instanceof Error) {
        errorMessage = exception.message || 'Internal server error';
      }
    }

    // 명세서에 맞는 에러 응답 형식
    const errorResponse: { error: string; code?: string } = {
      error: errorMessage,
      ...(errorCode ? { code: errorCode } : {}),
    };

    response.status(status).json(errorResponse);
  }
}

