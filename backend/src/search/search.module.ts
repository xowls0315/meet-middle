import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { KakaoLocalModule } from '../kakao-local/kakao-local.module';

@Module({
  imports: [KakaoLocalModule, ThrottlerModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

