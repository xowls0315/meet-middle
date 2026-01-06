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
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import type { Request } from 'express';

@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async createFavorite(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.favoritesService.create(user.id, createFavoriteDto);
  }

  @Get()
  async getFavorites(@Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.findAll(user.id);
  }

  @Delete(':placeId')
  async deleteFavorite(@Param('placeId') placeId: string, @Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.remove(user.id, placeId);
  }
}

