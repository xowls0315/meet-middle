import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const isProduction = process.env.NODE_ENV === 'production';

    // 프로덕션 환경에서 JWT_SECRET 검증
    if (isProduction && (!jwtSecret || jwtSecret === 'secret' || jwtSecret.length < 32)) {
      throw new Error(
        'JWT_SECRET is required and must be at least 32 characters long in production. ' +
          'Please set a strong random string in Render environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret || 'secret',
    });
  }

  async validate(payload: any) {
    // Access Token만 허용 (type 검증)
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

