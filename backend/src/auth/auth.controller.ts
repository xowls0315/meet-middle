import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@Controller('api/auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  @Public()
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    // Passport가 리다이렉트 처리
  }

  @Get('kakao/callback')
  @Public()
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      if (!user) {
        throw new Error('User not found');
      }
      const { access_token, user: userData } = await this.authService.login(user);

      // httpOnly 쿠키 설정
      res.cookie('access_token', access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      });

      // 프론트엔드로 리다이렉트
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?login=success`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?login=error`);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return {
      id: user.id,
      name: user.nickname,
      email: user.email,
      profileImage: user.profileImage,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.json({ message: '로그아웃되었습니다.' });
  }
}

