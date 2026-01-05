import { Controller, Post, Get, Body, Param, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/share')
@UseInterceptors(LoggingInterceptor)
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  @Public()
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  async createShare(@Body() createShareDto: CreateShareDto) {
    return this.shareService.create(createShareDto.data);
  }

  @Get(':id')
  @Public()
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  async getShare(@Param('id') id: string) {
    return this.shareService.findOne(id);
  }
}

