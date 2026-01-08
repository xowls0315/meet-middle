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
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import type { Request } from 'express';

@ApiTags('favorites')
@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '즐겨찾기 추가',
    description: '장소를 즐겨찾기에 추가합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '즐겨찾기 추가 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  @ApiResponse({
    status: 409,
    description: '이미 즐겨찾기에 추가된 장소',
  })
  async createFavorite(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.favoritesService.create(user.id, createFavoriteDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '즐겨찾기 목록 조회',
    description: '사용자의 모든 즐겨찾기를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 목록',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  async getFavorites(@Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.findAll(user.id);
  }

  @Delete(':placeId')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: '즐겨찾기 삭제',
    description: '즐겨찾기에서 장소를 삭제합니다.',
  })
  @ApiParam({
    name: 'placeId',
    description: '카카오 장소 ID',
    example: '8241891',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 삭제 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  @ApiResponse({
    status: 404,
    description: '즐겨찾기를 찾을 수 없음',
  })
  async deleteFavorite(@Param('placeId') placeId: string, @Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.remove(user.id, placeId);
  }
}

