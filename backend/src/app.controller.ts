import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '서버 상태 확인', description: '서버가 정상 작동 중인지 확인합니다.' })
  @ApiResponse({ status: 200, description: '서버 정상 작동' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: '헬스 체크', description: '서버 상태와 타임스탬프를 반환합니다.' })
  @ApiResponse({
    status: 200,
    description: '헬스 체크 성공',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-06T12:00:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
