import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({ description: '카카오 장소 ID', example: '8241891' })
  @IsString()
  placeId: string;

  @ApiProperty({ description: '장소 이름', example: '강남역' })
  @IsString()
  name: string;

  @ApiProperty({ description: '장소 주소', example: '서울특별시 강남구 강남대로 396' })
  @IsString()
  address: string;

  @ApiProperty({ description: '위도', example: 37.4981 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: '경도', example: 127.0276 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ description: '카카오 장소 URL', example: 'http://place.map.kakao.com/m/8241891', required: false })
  @IsOptional()
  @IsString()
  placeUrl?: string;
}

