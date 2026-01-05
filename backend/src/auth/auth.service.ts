import { Injectable } from '@nestjs/common';
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

  async login(kakaoUser: any) {
    // 카카오 사용자 정보로 DB에서 사용자 찾기 또는 생성
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

    // JWT 토큰 생성
    const payload = { sub: user.id, kakaoId: user.kakaoId };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        kakaoId: user.kakaoId,
        nickname: user.nickname,
        profileImage: user.profileImage,
        email: user.email,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}

