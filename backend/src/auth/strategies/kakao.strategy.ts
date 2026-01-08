import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import axios from 'axios';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  private readonly logger = new Logger(KakaoStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret = configService.get<string>('KAKAO_CLIENT_SECRET');
    const backendUrl =
      configService.get<string>('BACKEND_URL') || 'http://localhost:3001';

    // 환경변수 검증
    if (!clientID || !clientSecret) {
      const missingVars: string[] = [];
      if (!clientID) missingVars.push('KAKAO_CLIENT_ID');
      if (!clientSecret) missingVars.push('KAKAO_CLIENT_SECRET');

      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
          `Please set them in your .env file or environment variables.`,
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${backendUrl}/api/auth/kakao/callback`,
      // prompt=login: 항상 로그인 화면을 보여줌 (자동 로그인 방지)
      authorizationParams: {
        prompt: 'login',
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, _json } = profile;
    
    // 카카오 프로필에서 이메일 가져오기
    let email = _json?.kakao_account?.email;
    
    // 이메일이 없으면 카카오 API를 직접 호출하여 이메일 정보 가져오기
    if (!email && accessToken) {
      try {
        this.logger.debug('Fetching email from Kakao API...');
        const userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            property_keys: JSON.stringify(['kakao_account.email']),
          },
        });
        
        email = userInfoResponse.data?.kakao_account?.email;
        this.logger.debug(`Email from API: ${email || 'not available'}`);
      } catch (error: any) {
        this.logger.warn(
          `Failed to fetch email from Kakao API: ${error.message}`,
        );
        // 이메일을 가져오지 못해도 로그인은 진행
      }
    }
    
    const user = {
      kakaoId: id.toString(),
      nickname: username || _json?.properties?.nickname,
      profileImage: _json?.properties?.profile_image,
      email: email || null,
      accessToken,
    };
    
    this.logger.debug(`User created: ${user.nickname}, email: ${user.email || 'null'}`);
    return user;
  }
}

