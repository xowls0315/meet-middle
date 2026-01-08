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

      // Refresh Token만 쿠키에 저장 (보안 - HttpOnly로 XSS 방지)
      // 모바일 호환성을 위한 쿠키 설정: sameSite: 'none' + secure: true (HTTPS일 때 필수)
      const isProduction = process.env.NODE_ENV === 'production';
      const isHTTPS = req.protocol === 'https' || isProduction;
      
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: isHTTPS ? 'none' : 'lax', // HTTPS면 'none', 아니면 'lax'
        secure: isHTTPS, // HTTPS일 때만 true
        path: '/', // 모든 경로에서 접근 가능
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
        // domain 제거: 명시적 설정 시 모바일에서 문제 발생 가능
      });

      // Access Token은 URL 파라미터로 전달 (프론트엔드가 메모리/localStorage에 저장)
      // 프로덕션에서는 보안을 위해 URL 파라미터 사용 안 함
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (isProduction) {
        // 프로덕션: 쿠키만 사용 (보안)
        // 프론트엔드는 /api/auth/token 엔드포인트를 호출하여 Access Token 받기
        res.redirect(`${frontendUrl}/?login=success`);
      } else {
        // 개발 환경: URL 파라미터로 전달 (테스트용)
        res.redirect(`${frontendUrl}/?login=success&access_token=${encodeURIComponent(accessToken)}`);
      }
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?login=error`);
    }
  }

  @Get('token')
  @Public()
  @ApiOperation({
    summary: 'Access Token 발급',
    description: 'Refresh Token(쿠키)을 사용하여 Access Token을 발급받습니다. 로그인 직후 또는 Access Token 만료 시 사용합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Access Token 발급 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token이 없거나 유효하지 않음',
  })
  async getToken(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const accessToken = await this.authService.refresh(refreshToken);

    return {
      accessToken,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '로그인한 사용자의 정보를 조회합니다. Authorization 헤더에 Access Token을 포함해야 합니다.',
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
    description: 'Refresh Token(쿠키)을 사용하여 새로운 Access Token을 발급받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token이 없거나 유효하지 않음',
  })
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const newAccessToken = await this.authService.refresh(refreshToken);

    // Access Token을 JSON 응답으로 반환 (프론트엔드가 메모리/localStorage에 저장)
    return {
      accessToken: newAccessToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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

    // Refresh Token 쿠키 제거 (설정은 저장 시와 동일하게)
    const isProduction = process.env.NODE_ENV === 'production';
    const isHTTPS = req.protocol === 'https' || isProduction;
    
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: isHTTPS ? 'none' : 'lax',
      secure: isHTTPS,
      path: '/',
      // domain 제거: 명시적 설정 시 모바일에서 문제 발생 가능
    });

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

