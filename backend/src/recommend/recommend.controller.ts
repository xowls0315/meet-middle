import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RecommendService } from './recommend.service';
import { CreateRecommendDto } from './dto/create-recommend.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { RecommendResult } from './recommend.service';

@ApiTags('recommend')
@Controller('api/recommend')
@UseInterceptors(LoggingInterceptor)
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Post()
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: '중간 지점 추천',
    description:
      '참가자들의 위치를 기반으로 중간 지점을 추천합니다. 랜드마크(지하철역, 문화시설, 공공기관, 관광명소)를 우선적으로 추천합니다.',
  })
  @ApiBody({ type: CreateRecommendDto })
  @ApiResponse({
    status: 200,
    description: '추천 결과',
    schema: {
      example: {
        anchor: { lat: 37.5658, lng: 126.9837 },
        final: {
          placeId: '8241891',
          name: '강남역',
          address: '서울특별시 강남구 강남대로 396',
          lat: 37.4981,
          lng: 127.0276,
          placeUrl: 'http://place.map.kakao.com/m/8241891',
          distance: 500,
        },
        candidates: [],
        used: { category: 'SW8', radius: 2000 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (참가자 수, 라벨, 좌표 등)',
  })
  @ApiResponse({
    status: 429,
    description: '요청 한도 초과',
  })
  async recommend(@Body() createRecommendDto: CreateRecommendDto) {
    return this.recommendService.recommend(createRecommendDto.participants);
  }
}

