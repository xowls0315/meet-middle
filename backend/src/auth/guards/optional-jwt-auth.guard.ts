import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * 선택적 JWT 인증 Guard
 * 토큰이 있으면 사용자 정보를 설정하고, 없어도 통과합니다.
 * Public 엔드포인트에서 로그인한 사용자와 게스트 모두 접근 가능하도록 합니다.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 항상 JWT 검증을 시도 (토큰이 없어도 통과)
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any) {
    // 에러가 있어도 user가 없어도 계속 진행 (req.user는 undefined일 수 있음)
    // 토큰이 없거나 유효하지 않아도 에러를 발생시키지 않음
    return user || null;
  }
}

