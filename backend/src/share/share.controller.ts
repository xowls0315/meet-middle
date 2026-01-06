import { Controller, Post, Get, Body, Param, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('share')
@Controller('api/share')
@UseInterceptors(LoggingInterceptor)
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  @Public()
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: '공유 링크 생성',
    description:
      '추천 결과를 공유할 수 있는 링크를 생성합니다. 링크는 7일간 유효합니다.',
  })
  @ApiBody({ type: CreateShareDto })
  @ApiResponse({
    status: 201,
    description: '공유 링크 생성 성공',
    schema: {
      example: {
        shareId: '23f5b2bd-df9c-4315-9e84-09198d3cc3a0',
        url: 'http://localhost:3000/share/23f5b2bd-df9c-4315-9e84-09198d3cc3a0',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 429,
    description: '요청 한도 초과',
  })
  async createShare(@Body() createShareDto: CreateShareDto) {
    return this.shareService.create(createShareDto.data);
  }

  @Get(':id')
  @Public()
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: '공유 링크 조회',
    description: '공유 링크 ID로 추천 결과를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '공유 링크 ID (UUID)',
    example: '23f5b2bd-df9c-4315-9e84-09198d3cc3a0',
  })
  @ApiResponse({
    status: 200,
    description: '공유 데이터 조회 성공',
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
        },
        candidates: [],
        participants: [
          { label: 'A', lat: 37.5665, lng: 126.9780 },
          { label: 'B', lat: 37.5651, lng: 126.9895 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '공유 링크를 찾을 수 없거나 만료됨',
  })
  @ApiResponse({
    status: 429,
    description: '요청 한도 초과',
  })
  async getShare(@Param('id') id: string) {
    return this.shareService.findOne(id);
  }
}

