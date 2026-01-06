import {
  IsObject,
  ValidateNested,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FinalPlaceDto {
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

  @ApiProperty({ description: '카카오 장소 URL', example: 'http://place.map.kakao.com/m/8241891' })
  @IsString()
  placeUrl: string;

  @ApiProperty({ description: '거리 (미터)', example: 500, required: false })
  @IsNumber()
  @Min(0)
  distance?: number;
}

export class CreateMeetingDto {
  @ApiProperty({ description: '최종 추천 장소', type: FinalPlaceDto })
  @IsObject()
  @ValidateNested()
  @Type(() => FinalPlaceDto)
  final: FinalPlaceDto;

  @ApiProperty({ description: '참가자 수', example: 2, enum: [2, 3, 4] })
  @IsNumber()
  @IsIn([2, 3, 4])
  participantCount: number;
}

