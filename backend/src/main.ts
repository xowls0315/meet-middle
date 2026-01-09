import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // 프로덕션 환경에서 필수 환경변수 검증
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const requiredEnvVars = [
      'DB_URL',
      'KAKAO_REST_KEY',
      'KAKAO_CLIENT_ID',
      'KAKAO_CLIENT_SECRET',
      'JWT_SECRET',
      'BACKEND_URL',
      'FRONTEND_URL',
    ];

    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach((key) => console.error(`   - ${key}`));
      console.error('\nPlease set these environment variables in Render dashboard.');
      process.exit(1);
    }

    // JWT_SECRET 보안 검증
    if (process.env.JWT_SECRET === 'secret' || (process.env.JWT_SECRET?.length || 0) < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET is too weak. Use a strong random string (minimum 32 characters).');
    }
  }

  const app = await NestFactory.create(AppModule);

  // CORS 설정 (모바일 호환성 개선)
  app.enableCors({
    origin: [
      'https://meet-middle-frontend.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true, // 쿠키 전송 허용 (모바일 필수)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie', 'X-New-Access-Token'], // 토큰 자동 갱신 헤더 노출
  });

  // Cookie parser 미들웨어
  app.use(cookieParser());

  // 전역 Exception Filter는 AppModule에서 APP_FILTER로 등록됨

  // Validation pipe 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Meet-Middle API')
    .setDescription('약속 장소 중간 지점 추천 서비스 API 문서')
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('search', '장소 검색 API')
    .addTag('recommend', '중간 지점 추천 API')
    .addTag('share', '공유 링크 API')
    .addTag('meetings', '약속 기록 API')
    .addTag('favorites', '즐겨찾기 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .addServer('http://localhost:3001', '로컬 개발 서버')
    .addServer(
      process.env.BACKEND_URL || 'https://your-backend-service.onrender.com',
      '프로덕션 서버 (Render)',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api-docs`);
}
bootstrap();
