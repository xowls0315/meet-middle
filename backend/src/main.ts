import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Cookie parser 미들웨어
  app.use(cookieParser());

  // 전역 Exception Filter (명세서에 맞는 에러 응답 형식)
  app.useGlobalFilters(new HttpExceptionFilter());

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
