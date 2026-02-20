import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './auth/entities/user.entity';
import { Share } from './share/entities/share.entity';
import { Meeting } from './meetings/entities/meeting.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { KakaoLocalModule } from './kakao-local/kakao-local.module';
import { SearchModule } from './search/search.module';
import { RecommendModule } from './recommend/recommend.module';
import { ShareModule } from './share/share.module';
import { AuthModule } from './auth/auth.module';
import { MeetingsModule } from './meetings/meetings.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = Number(configService.get<string>('DB_PORT') || 5432);
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbDatabase = configService.get<string>('DB_DATABASE');
        const dbSchema = configService.get<string>('DB_SCHEMA') || 'public';
        const isProduction = process.env.NODE_ENV === 'production';

        // DB 환경변수 검증
        if (!dbHost || !dbUsername || !dbPassword || !dbDatabase) {
          throw new Error(
            'DB environment variables are required (DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE). Please set them in your .env file or Render environment variables.',
          );
        }

        const requireSSL = process.env.DB_SSL === 'true' || isProduction;

        // 호스트 기반 클라우드 DB 추정 (대부분 SSL 필요)
        const isCloudDB =
          dbHost.includes('render.com') ||
          dbHost.includes('neon.tech') ||
          dbHost.includes('supabase.co') ||
          dbHost.includes('railway.app') ||
          dbHost.includes('herokuapp.com');

        const escapedSearchPath = /^[A-Za-z_][A-Za-z0-9_]*$/.test(dbSchema)
          ? dbSchema
          : `"${dbSchema.replace(/"/g, '""')}"`;

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          schema: dbSchema,
          extra: {
            options: `-c search_path=${escapedSearchPath}`,
          },
          entities: [User, Share, Meeting, Favorite],
          synchronize: !isProduction, // 개발 환경에서만 자동 동기화
          logging: process.env.NODE_ENV === 'development',
          // SSL 설정 (클라우드 DB 또는 명시적으로 요구하는 경우)
          ssl:
            requireSSL || isCloudDB
              ? {
                  rejectUnauthorized: false, // 자체 서명 인증서 허용
                }
              : false,
        };
      },
      inject: [ConfigService],
    }),
    // Rate limiting 설정
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1분
        limit: 30, // suggest용
      },
      {
        name: 'medium',
        ttl: 60000, // 1분
        limit: 10, // recommend/share용
      },
    ]),
    // 캐시 설정 (인메모리 캐시)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 60, // 기본 60초
        max: 100, // 최대 캐시 항목 수
      }),
    }),
    // 기능 모듈
    KakaoLocalModule,
    SearchModule,
    RecommendModule,
    ShareModule,
    AuthModule,
    MeetingsModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
