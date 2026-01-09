import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Access Token과 Refresh Token 생성
   */
  generateTokens(userId: string) {
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '14d';

    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { expiresIn: accessExpiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }

  /**
   * 사용자 찾기 또는 생성
   */
  private async findOrCreateUser(kakaoUser: any): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { kakaoId: kakaoUser.kakaoId },
    });

    if (!user) {
      user = this.userRepository.create({
        kakaoId: kakaoUser.kakaoId,
        nickname: kakaoUser.nickname,
        profileImage: kakaoUser.profileImage,
        email: kakaoUser.email,
      });
      await this.userRepository.save(user);
    } else {
      // 정보 업데이트
      user.nickname = kakaoUser.nickname || user.nickname;
      user.profileImage = kakaoUser.profileImage || user.profileImage;
      user.email = kakaoUser.email || user.email;
      await this.userRepository.save(user);
    }

    return user;
  }

  async login(kakaoUser: any) {
    const user = await this.findOrCreateUser(kakaoUser);

    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Refresh Token DB 저장 (중요)
    await this.userRepository.update(user.id, {
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        kakaoId: user.kakaoId,
        nickname: user.nickname,
        profileImage: user.profileImage,
        email: user.email,
      },
    };
  }

  /**
   * Refresh Token으로 Access Token 갱신
   */
  async refresh(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Refresh Token 타입 검증
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // DB에서 사용자와 Refresh Token 확인
      const user = await this.userRepository.findOne({
        where: {
          id: payload.sub,
          refreshToken,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 새로운 Access Token 발급
      const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
      return this.jwtService.sign(
        { sub: user.id, type: 'access' },
        { expiresIn: accessExpiresIn },
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * 사용자 검증 (JWT Strategy용)
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Access Token에서 사용자 ID 추출 (만료 여부 확인 없이)
   */
  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * 로그아웃 처리 (Refresh Token 제거)
   */
  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }

  /**
   * 카카오 OAuth code로 사용자 정보 가져오기 및 로그인 처리
   */
  async handleKakaoCode(code: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const clientID = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const frontendUrl = process.env.FRONTEND_URL;

    // 환경변수 검증
    if (!clientID || !clientSecret) {
      this.logger.error('Kakao client credentials not configured');
      throw new UnauthorizedException('Kakao client credentials not configured');
    }

    if (!frontendUrl) {
      this.logger.error('FRONTEND_URL is not configured');
      throw new UnauthorizedException('FRONTEND_URL is not configured');
    }

    const redirectUri = `${frontendUrl}/auth/kakao/callback`;

    try {
      // 1. 카카오 Access Token 발급
      let tokenResponse;
      try {
        tokenResponse = await axios.post(
          'https://kauth.kakao.com/oauth/token',
          new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientID,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
      } catch (error: any) {
        this.logger.error(`Kakao token request failed: ${error.message}`);
        if (error.response?.data) {
          const errorData = error.response.data;
          this.logger.error(`Kakao token API error: ${JSON.stringify(errorData)}`);
          
          // 구체적인 에러 메시지 제공
          if (errorData.error === 'invalid_grant') {
            throw new UnauthorizedException('Invalid authorization code. The code may have expired or already been used.');
          }
          if (errorData.error === 'invalid_request') {
            throw new UnauthorizedException(`Invalid request: ${errorData.error_description || 'Please check your redirect URI configuration'}`);
          }
        }
        throw new UnauthorizedException('Failed to get Kakao access token');
      }

      const kakaoAccessToken = tokenResponse?.data?.access_token;
      if (!kakaoAccessToken) {
        this.logger.error('Kakao access token not found in response');
        throw new UnauthorizedException('Failed to get Kakao access token');
      }

      // 2. 카카오 사용자 정보 가져오기
      let userInfoResponse;
      try {
        userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${kakaoAccessToken}`,
          },
          params: {
            property_keys: JSON.stringify(['kakao_account.email', 'properties.nickname', 'properties.profile_image']),
          },
        });
      } catch (error: any) {
        this.logger.error(`Kakao user info request failed: ${error.message}`);
        if (error.response?.data) {
          this.logger.error(`Kakao user info API error: ${JSON.stringify(error.response.data)}`);
        }
        throw new UnauthorizedException('Failed to get user information from Kakao');
      }

      const kakaoUserData = userInfoResponse?.data;
      if (!kakaoUserData || !kakaoUserData.id) {
        this.logger.error('Invalid user data from Kakao');
        throw new UnauthorizedException('Invalid user data from Kakao');
      }

      const kakaoId = kakaoUserData.id.toString();
      const nickname = kakaoUserData.properties?.nickname || kakaoUserData.kakao_account?.profile?.nickname || '카카오사용자';
      const profileImage = kakaoUserData.properties?.profile_image || kakaoUserData.kakao_account?.profile?.profile_image_url || null;
      const email = kakaoUserData.kakao_account?.email || null;

      // 3. 사용자 정보로 로그인 처리
      const kakaoUser = {
        kakaoId,
        nickname,
        profileImage,
        email,
        accessToken: kakaoAccessToken,
      };

      return await this.login(kakaoUser);
    } catch (error: any) {
      // 이미 UnauthorizedException이면 그대로 throw
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // 예상치 못한 에러
      this.logger.error(`Unexpected error in handleKakaoCode: ${error.message}`, error.stack);
      throw new UnauthorizedException('Failed to authenticate with Kakao');
    }
  }
}

