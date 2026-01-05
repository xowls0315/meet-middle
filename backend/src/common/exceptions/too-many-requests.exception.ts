import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'KAKAO_RATE_LIMIT') {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: '잠시 후 다시 시도해주세요',
        error: message,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

