import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { KakaoLocalModule } from '../kakao-local/kakao-local.module';

@Module({
  imports: [KakaoLocalModule, CacheModule, ThrottlerModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

