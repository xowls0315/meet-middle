import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(userId: string, createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    // 중복 추가 방지: placeId unique 제약
    const existing = await this.favoriteRepository.findOne({
      where: {
        userId,
        placeId: createFavoriteDto.placeId,
      },
    });

    if (existing) {
      throw new ConflictException('이미 즐겨찾기에 추가된 장소입니다.');
    }

    const favorite = this.favoriteRepository.create({
      userId,
      ...createFavoriteDto,
      // 좌표 소수점 6자리 제한
      lat: Number(createFavoriteDto.lat.toFixed(6)),
      lng: Number(createFavoriteDto.lng.toFixed(6)),
    });

    return this.favoriteRepository.save(favorite);
  }

  async findAll(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(userId: string, placeId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId,
        placeId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    }

    await this.favoriteRepository.remove(favorite);
  }
}

