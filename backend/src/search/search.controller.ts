import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@Controller('api/search')
@UseInterceptors(LoggingInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggest')
  @Throttle({ short: { limit: 30, ttl: 60000 } })
  async suggest(@Query('q') query: string) {
    return this.searchService.suggest(query);
  }
}

