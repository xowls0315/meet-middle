import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiBody,
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
    description: '카카오 로그인 페이지로 리다이렉트합니다. 프론트엔드로 콜백되도록 설정되어 있습니다. prompt=login 파라미터로 항상 로그인 화면을 표시합니다.',
  })
  async kakaoAuth(@Res() res: Response) {
    // 환경변수 검증
    const clientID = process.env.KAKAO_CLIENT_ID;
    const frontendUrl = process.env.FRONTEND_URL;
    
    if (!clientID) {
      throw new BadRequestException('KAKAO_CLIENT_ID is not configured');
    }
    
    if (!frontendUrl) {
      throw new BadRequestException('FRONTEND_URL is not configured');
    }
    
    // 카카오 로그인 URL 직접 생성 (prompt=login 명시적으로 추가)
    // 콜백은 프론트엔드로 설정 (iOS 호환성)
    const callbackURL = `${frontendUrl}/auth/kakao/callback`;
    
    // prompt=login: 항상 로그인 화면 표시 (자동 로그인 방지)
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&response_type=code&prompt=login`;
    
    res.redirect(kakaoAuthUrl);
  }

  @Post('kakao')
  @Public()
  @ApiOperation({
    summary: '카카오 로그인 처리',
    description: '프론트엔드에서 받은 카카오 OAuth code를 처리하여 토큰을 발급합니다. iOS 호환성을 위해 프론트엔드에서 code를 받아서 호출하는 방식입니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: '카카오 OAuth 인증 코드',
          example: 'abc123def456...',
        },
      },
      required: ['code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공 (Refresh Token은 쿠키에 저장됨)',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          kakaoId: '123456789',
          nickname: '홍길동',
          email: 'hong@example.com',
          profileImage: 'https://k.kakaocdn.net/...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'code가 제공되지 않음',
  })
  @ApiResponse({
    status: 401,
    description: '카카오 인증 실패',
  })
  async kakaoLogin(
    @Body() body: { code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const { accessToken, refreshToken, user } = await this.authService.handleKakaoCode(body.code);

      // Refresh Token만 쿠키에 저장 (보안 - HttpOnly로 XSS 방지)
      // 모바일 호환성을 위한 쿠키 설정: sameSite: 'none' + secure: true (프로덕션 환경)
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,        // 항상 true
        sameSite: 'none',    // 항상 none
        path: '/',
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
      });

      // Access Token과 사용자 정보를 JSON으로 반환
      // 프론트엔드에서 Access Token을 저장하고 사용
      return {
        accessToken,
        user,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Kakao');
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
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,        // 항상 true
      sameSite: 'none',    // 항상 none
      path: '/',
    });

    // 카카오 로그아웃 URL 생성 및 직접 리다이렉트
    // ⚠️ 중요: 카카오 개발자 콘솔에 로그아웃 리다이렉트 URI를 등록해야 함
    // 제품 설정 → 카카오 로그인 → 로그아웃 리다이렉트 URI
    const clientID = process.env.KAKAO_CLIENT_ID;
    const frontendUrl = process.env.FRONTEND_URL;
    
    if (!clientID || !frontendUrl) {
      // 환경변수가 없으면 프론트엔드로만 리다이렉트
      return res.redirect(frontendUrl || 'http://localhost:3000');
    }
    
    const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${clientID}&logout_redirect_uri=${encodeURIComponent(frontendUrl)}`;

    // 카카오 로그아웃 URL로 직접 리다이렉트 (카카오 세션도 함께 종료)
    res.redirect(kakaoLogoutUrl);
  }
}

