import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../../auth/auth.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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
        errorMessage = (exceptionResponse as any).error || errorMessage;
        errorCode = (exceptionResponse as any).error;
      }

      // 401 에러이고 AuthService가 있으면 토큰 자동 갱신 시도
      if (
        status === HttpStatus.UNAUTHORIZED &&
        exception instanceof UnauthorizedException &&
        this.authService
      ) {
        // Public 엔드포인트는 토큰 갱신 시도하지 않음
        const isPublicRoute =
          request.route?.path?.includes('/auth/') ||
          request.url?.includes('/auth/kakao') ||
          request.url?.includes('/auth/token') ||
          request.url?.includes('/api-docs');

        if (!isPublicRoute) {
          // Refresh Token 확인
          const refreshToken = request.cookies?.['refresh_token'];

          if (refreshToken) {
            try {
              // Refresh Token으로 새 Access Token 발급
              const newAccessToken = await this.authService.refresh(refreshToken);

              // 응답 헤더에 새 Access Token 포함
              response.setHeader('X-New-Access-Token', newAccessToken);
              response.setHeader('X-Token-Refreshed', 'true');

              this.logger.debug(
                `Access Token 자동 갱신 성공: ${request.method} ${request.url}`,
              );

              // 응답 본문에 새 토큰 포함
              const errorResponse: { error: string; code?: string; newAccessToken?: string } = {
                error: errorMessage,
                newAccessToken,
                ...(errorCode ? { code: errorCode } : {}),
              };

              return response.status(status).json(errorResponse);
            } catch (refreshError) {
              // Refresh Token도 유효하지 않으면 원래 에러 반환
              this.logger.debug(
                `Access Token 자동 갱신 실패: ${request.method} ${request.url} - ${refreshError.message}`,
              );
            }
          }
        }
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

