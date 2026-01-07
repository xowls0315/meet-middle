import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('auth')
@Controller('api/auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: '카카오 로그인 시작',
    description: '카카오 로그인 페이지로 리다이렉트합니다. prompt=login 파라미터로 항상 로그인 화면을 표시합니다.',
  })
  async kakaoAuth(@Res() res: Response) {
    // 카카오 로그인 URL 직접 생성 (prompt=login 명시적으로 추가)
    const clientID = process.env.KAKAO_CLIENT_ID || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const callbackURL = `${backendUrl}/api/auth/kakao/callback`;
    
    // prompt=login: 항상 로그인 화면 표시 (자동 로그인 방지)
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&response_type=code&prompt=login`;
    
    res.redirect(kakaoAuthUrl);
  }

  @Get('kakao/callback')
  @Public()
  @UseGuards(AuthGuard('kakao'))
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: '카카오 로그인 콜백',
    description: '카카오 로그인 후 콜백을 처리합니다.',
  })
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      if (!user) {
        throw new Error('User not found');
      }
      const { accessToken, refreshToken, user: userData } =
        await this.authService.login(user);

      // 쿠키 옵션 설정 (cross-origin 요청을 위한 설정)
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        // cross-origin 요청에서 쿠키 전송을 위해 'none' 사용 (HTTPS 필수)
        sameSite: (isProduction ? 'none' : (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax') as 'lax' | 'strict' | 'none',
        // sameSite: 'none'일 때는 secure: true 필수
        secure: isProduction || process.env.COOKIE_SECURE === 'true',
        // 백엔드 도메인에 쿠키 설정 (cross-origin 요청 시 필요)
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/',
      };

      // Access Token 쿠키 설정 (15분)
      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15분
      });

      // Refresh Token 쿠키 설정 (14일)
      res.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '홍길동',
        email: 'hong@example.com',
        profileImage: 'https://k.kakaocdn.net/...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return {
      id: user.id,
      name: user.nickname,
      email: user.email,
      profileImage: user.profileImage,
    };
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Access Token 갱신',
    description: 'Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token이 없거나 유효하지 않음',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const newAccessToken = await this.authService.refresh(refreshToken);

    // 쿠키 옵션 설정 (cross-origin 요청을 위한 설정)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: (isProduction ? 'none' : (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax') as 'lax' | 'strict' | 'none',
      secure: isProduction || process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
    };

    // 새로운 Access Token 쿠키 설정
    res.cookie('access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15분
    });

    res.json({ success: true });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '로그아웃',
    description:
      '로그아웃하고 Refresh Token을 제거합니다. 카카오 세션도 함께 로그아웃하기 위해 카카오 로그아웃 URL로 리다이렉트합니다.',
  })
  @ApiResponse({
    status: 302,
    description: '카카오 로그아웃 URL로 리다이렉트',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;

    // DB에서 Refresh Token 제거 (보안 핵심)
    await this.authService.logout(user.id);

    // 쿠키 옵션 설정 (cross-origin 요청을 위한 설정)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: (isProduction ? 'none' : (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax') as 'lax' | 'strict' | 'none',
      secure: isProduction || process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
    };

    // 쿠키 제거 (옵션 명시로 확실히 제거)
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    // 카카오 로그아웃 URL 생성 및 직접 리다이렉트
    // ⚠️ 중요: 카카오 개발자 콘솔에 로그아웃 리다이렉트 URI를 등록해야 함
    // 제품 설정 → 카카오 로그인 → 로그아웃 리다이렉트 URI
    const clientID = process.env.KAKAO_CLIENT_ID || '';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${clientID}&logout_redirect_uri=${encodeURIComponent(frontendUrl)}`;

    // 카카오 로그아웃 URL로 직접 리다이렉트 (카카오 세션도 함께 종료)
    res.redirect(kakaoLogoutUrl);
  }
}

