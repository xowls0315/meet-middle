import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './auth/entities/user.entity';
import { Share } from './share/entities/share.entity';
import { Meeting } from './meetings/entities/meeting.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DB_URL'),
        entities: [User, Share, Meeting, Favorite],
        synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 자동 동기화
        logging: process.env.NODE_ENV === 'development',
      }),
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
    // 캐시 설정
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // 기본 60초
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
  ],
})
export class AppModule {}
