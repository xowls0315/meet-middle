import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID') || '',
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET') || '',
      callbackURL: `${backendUrl}/api/auth/kakao/callback`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, _json } = profile;
    const user = {
      kakaoId: id.toString(),
      nickname: username || _json?.properties?.nickname,
      profileImage: _json?.properties?.profile_image,
      email: _json?.kakao_account?.email,
      accessToken,
    };
    return user;
  }
}

