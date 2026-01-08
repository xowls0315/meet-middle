import { ApiProperty } from '@nestjs/swagger';

export class PlaceDto {
  @ApiProperty({ description: '카카오 장소 ID', example: '8241891' })
  placeId: string;

  @ApiProperty({ description: '장소 이름', example: '강남역' })
  name: string;

  @ApiProperty({ description: '장소 주소', example: '서울특별시 강남구 강남대로 396' })
  address: string;

  @ApiProperty({ description: '위도', example: 37.4981 })
  lat: number;

  @ApiProperty({ description: '경도', example: 127.0276 })
  lng: number;

  @ApiProperty({
    description: '카카오 장소 URL',
    example: 'http://place.map.kakao.com/m/8241891',
    required: false,
  })
  placeUrl?: string;

  @ApiProperty({ description: '거리 (미터)', example: 500, required: false })
  distance?: number;
}

