import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';
import { KakaoLocalModule } from '../kakao-local/kakao-local.module';

@Module({
  imports: [KakaoLocalModule, CacheModule, ThrottlerModule],
  controllers: [RecommendController],
  providers: [RecommendService],
})
export class RecommendModule {}

