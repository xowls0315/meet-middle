import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import type { Request } from 'express';

@ApiTags('meetings')
@Controller('api/meetings')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '약속 기록 생성',
    description: '약속 장소를 기록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '약속 기록 생성 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2026-01-06T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.meetingsService.create(user.id, createMeetingDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '약속 기록 목록 조회',
    description: '사용자의 모든 약속 기록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '약속 기록 목록',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2026-01-06T12:00:00.000Z',
          final: {
            placeId: '8241891',
            name: '강남역',
            address: '서울특별시 강남구 강남대로 396',
            lat: 37.4981,
            lng: 127.0276,
            placeUrl: 'http://place.map.kakao.com/m/8241891',
          },
          participantCount: 2,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  async getMeetings(@Req() req: Request) {
    const user = req.user as any;
    return this.meetingsService.findAll(user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '약속 기록 삭제',
    description: '약속 기록을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '약속 기록 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '약속 기록 삭제 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '약속 기록을 찾을 수 없음',
  })
  async deleteMeeting(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.meetingsService.remove(user.id, id);
  }
}

