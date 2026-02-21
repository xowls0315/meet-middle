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

// 로컬 HTTP에서는 secure=false, sameSite=lax 사용 (쿠키 전송 허용)
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'lax' | 'none',
    path: '/' as const,
    maxAge: 14 * 24 * 60 * 60 * 1000,
  };
}

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
    description:
      '카카오 로그인 페이지로 리다이렉트합니다. 콜백은 백엔드(/api/auth/kakao/callback)로 설정되어 있으며, 이후 백엔드에서 로그인 처리 후 프론트엔드로 리다이렉트합니다.',
  })
  async kakaoAuth(@Res() res: Response) {
    // 환경변수 검증
    const clientID = process.env.KAKAO_CLIENT_ID;
    const backendUrl = process.env.BACKEND_URL;
    
    if (!clientID) {
      throw new BadRequestException('KAKAO_CLIENT_ID is not configured');
    }
    
    if (!backendUrl) {
      throw new BadRequestException('BACKEND_URL is not configured');
    }
    
    // 카카오 로그인 URL 직접 생성 (prompt=login 명시적으로 추가)
    // 콜백은 백엔드로 설정
    const callbackURL = `${backendUrl}/api/auth/kakao/callback`;
    
    // prompt=login: 항상 로그인 화면 표시 (자동 로그인 방지)
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&response_type=code&prompt=login`;
    
    res.redirect(kakaoAuthUrl);
  }

  @Get('kakao/callback')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: '카카오 로그인 콜백 (백엔드)',
    description:
      '카카오에서 전달한 authorization code로 로그인 처리를 수행하고 Refresh Token 쿠키를 설정한 뒤 프론트엔드로 리다이렉트합니다.',
  })
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    const code = (req.query['code'] as string) || '';

    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const { refreshToken } = await this.authService.handleKakaoCode(code);

      res.cookie('refresh_token', refreshToken, getCookieOptions());
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/?login=success`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/?login=error`;
      return res.redirect(redirectUrl);
    }
  }

  @Post('kakao')
  @Public()
  @ApiOperation({
    summary: '카카오 로그인 처리',
    description: '프론트엔드에서 받은 카카오 OAuth code를 처리하여 토큰을 발급합니다. (현재 웹 플로우에서는 백엔드 콜백을 사용하므로, 주로 모바일/기타 클라이언트에서 사용 가능합니다.)',
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

      res.cookie('refresh_token', refreshToken, getCookieOptions());
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

  @Post('local/register')
  @Public()
  @ApiOperation({
    summary: '로컬 회원가입 (ID/PW)',
    description: '카카오 로그인 외에 ID/비밀번호 기반 회원가입을 처리합니다. 비밀번호는 8자 이상이어야 합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: '로그인 아이디', example: 'user01' },
        email: { type: 'string', format: 'email', description: '이메일 (ID/PW 찾기용)', example: 'user@example.com' },
        password: { type: 'string', format: 'password', description: '비밀번호 (8자 이상)', example: 'password123' },
      },
      required: ['username', 'email', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공 (Refresh Token은 쿠키에 저장됨)',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: '550e8400-e29b-41d4-a716-446655440000', nickname: 'user01', email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (형식 오류, 중복 아이디/이메일, 비밀번호 8자 미만)' })
  async registerLocal(
    @Body() body: { username: string; email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, email, password } = body;
    const { accessToken, refreshToken, user } = await this.authService.registerLocal(
      username,
      email,
      password,
    );

    res.cookie('refresh_token', refreshToken, getCookieOptions());
    return { accessToken, user };
  }

  @Post('local/login')
  @Public()
  @ApiOperation({
    summary: '로컬 로그인 (ID/이메일 + PW)',
    description: 'ID 또는 이메일과 비밀번호로 로그인합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string', description: '아이디 또는 이메일', example: 'user01' },
        password: { type: 'string', format: 'password', description: '비밀번호', example: 'password123' },
      },
      required: ['identifier', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공 (Refresh Token은 쿠키에 저장됨)',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: '550e8400-e29b-41d4-a716-446655440000', nickname: 'user01', email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '아이디 또는 비밀번호 오류' })
  async loginLocal(
    @Body() body: { identifier: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { identifier, password } = body;
    const { accessToken, refreshToken, user } = await this.authService.loginLocal(
      identifier,
      password,
    );

    res.cookie('refresh_token', refreshToken, getCookieOptions());
    return { accessToken, user };
  }

  @Post('local/find-id')
  @Public()
  @ApiOperation({
    summary: 'ID 찾기 (이메일 기반)',
    description: '이메일로 가입된 username(ID)를 조회합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email', description: '가입 시 입력한 이메일', example: 'user@example.com' } },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '조회 결과',
    schema: { type: 'object', properties: { username: { type: 'string', nullable: true, description: '등록된 아이디 (없으면 null)' } } },
  })
  @ApiResponse({ status: 400, description: 'email 필수' })
  async findId(@Body() body: { email: string }) {
    return this.authService.findUsernameByEmail(body.email);
  }

  @Post('local/find-password/verify')
  @Public()
  @ApiOperation({
    summary: '비밀번호 찾기 1단계: 이메일 검증',
    description: '해당 이메일로 가입된 로컬 계정 존재 여부를 확인합니다. 성공 시 2단계에서 새 비밀번호 입력 가능.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email', description: '가입 시 입력한 이메일', example: 'user@example.com' } },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '검증 결과',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string', example: '가입된 계정입니다. 새 비밀번호를 입력해 주세요.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'email 필수' })
  async verifyEmailForPasswordReset(@Body() body: { email: string }) {
    return this.authService.verifyEmailForPasswordReset(body.email);
  }

  @Post('local/find-password/reset')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정',
    description: '이메일 검증 후 새 비밀번호(8자 이상)로 변경합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', description: '가입 이메일', example: 'user@example.com' },
        newPassword: { type: 'string', format: 'password', description: '새 비밀번호 (8자 이상)', example: 'newpass123' },
        newPasswordConfirm: { type: 'string', format: 'password', description: '새 비밀번호 확인', example: 'newpass123' },
      },
      required: ['email', 'newPassword', 'newPasswordConfirm'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string', example: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '입력 오류(8자 미만, 비밀번호 불일치, 해당 이메일 계정 없음)' })
  async resetPassword(
    @Body()
    body: {
      email: string;
      newPassword: string;
      newPasswordConfirm: string;
    },
  ) {
    const { email, newPassword, newPasswordConfirm } = body;
    return this.authService.resetPassword(
      email,
      newPassword,
      newPasswordConfirm,
    );
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
      ...getCookieOptions(),
      maxAge: 0,
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

