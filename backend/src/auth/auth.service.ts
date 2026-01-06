import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Access Token과 Refresh Token 생성
   */
  generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '14d' },
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
      return this.jwtService.sign(
        { sub: user.id, type: 'access' },
        { expiresIn: '15m' },
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
   * 로그아웃 처리 (Refresh Token 제거)
   */
  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }
}

