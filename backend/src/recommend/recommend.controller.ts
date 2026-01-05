import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RecommendService } from './recommend.service';
import { CreateRecommendDto } from './dto/create-recommend.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@Controller('api/recommend')
@UseInterceptors(LoggingInterceptor)
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Post()
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  async recommend(@Body() createRecommendDto: CreateRecommendDto) {
    return this.recommendService.recommend(createRecommendDto.participants);
  }
}

