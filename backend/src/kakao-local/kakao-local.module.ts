import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KakaoLocalService } from './kakao-local.service';

@Module({
  imports: [ConfigModule],
  providers: [KakaoLocalService],
  exports: [KakaoLocalService],
})
export class KakaoLocalModule {}

