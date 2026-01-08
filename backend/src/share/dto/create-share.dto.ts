import {
  IsObject,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ParticipantMinimalDto {
  @ApiProperty({ description: '참가자 라벨', example: 'A' })
  @IsString()
  label: string;

  @ApiProperty({ description: '위도', example: 37.5665 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: '경도', example: 126.9780 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

class PlaceMinimalDto {
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

  @ApiProperty({ description: '거리 (미터)', example: 500, required: false })
  @IsOptional()
  @IsNumber()
  distance?: number;
}

class ShareDataDto {
  @ApiProperty({ description: '중간 지점 좌표', example: { lat: 37.5658, lng: 126.9837 } })
  @IsObject()
  anchor: {
    lat: number;
    lng: number;
  };

  @ApiProperty({ description: '참가자 목록', type: [ParticipantMinimalDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantMinimalDto)
  participants: ParticipantMinimalDto[];

  @ApiProperty({ description: '최종 추천 장소', type: PlaceMinimalDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PlaceMinimalDto)
  final: PlaceMinimalDto;

  @ApiProperty({ description: '후보 장소 목록 (최대 10개)', type: [PlaceMinimalDto] })
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PlaceMinimalDto)
  candidates: PlaceMinimalDto[];

  @ApiProperty({ description: '사용된 카테고리 및 반경', example: { category: 'SW8', radius: 2000 }, required: false })
  @IsOptional()
  @IsObject()
  used?: {
    category: string;
    radius: number;
  };
}

export class CreateShareDto {
  @ApiProperty({ description: '공유할 데이터', type: ShareDataDto })
  @ValidateNested()
  @Type(() => ShareDataDto)
  data: ShareDataDto;
}

