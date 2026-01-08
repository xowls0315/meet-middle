import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { PlaceDto } from '../common/dto/place.dto';

@ApiTags('search')
@Controller('api/search')
@UseInterceptors(LoggingInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggest')
  @Throttle({ short: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: '장소 자동완성 검색',
    description: '키워드로 장소를 검색하여 자동완성 결과를 반환합니다.',
  })
  @ApiQuery({
    name: 'q',
    description: '검색 키워드 (최소 2자)',
    example: '강남역',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과',
    type: [PlaceDto],
  })
  @ApiResponse({
    status: 429,
    description: '요청 한도 초과',
  })
  async suggest(@Query('q') query: string) {
    return this.searchService.suggest(query);
  }
}

