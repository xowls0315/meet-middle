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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import type { Request } from 'express';

@Controller('api/meetings')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.meetingsService.create(user.id, createMeetingDto);
  }

  @Get()
  async getMeetings(@Req() req: Request) {
    const user = req.user as any;
    return this.meetingsService.findAll(user.id);
  }

  @Delete(':id')
  async deleteMeeting(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.meetingsService.remove(user.id, id);
  }
}

