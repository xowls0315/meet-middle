import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';
import { KakaoLocalModule } from '../kakao-local/kakao-local.module';

@Module({
  imports: [KakaoLocalModule, ThrottlerModule],
  controllers: [RecommendController],
  providers: [RecommendService],
})
export class RecommendModule {}

