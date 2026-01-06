import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  IsIn,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ParticipantDto {
  @ApiProperty({
    description: '참가자 라벨',
    example: 'A',
    enum: ['A', 'B', 'C', 'D'],
  })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
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

export class CreateRecommendDto {
  @ApiProperty({
    description: '참가자 목록 (2~4명)',
    type: [ParticipantDto],
    example: [
      { label: 'A', lat: 37.5665, lng: 126.9780 },
      { label: 'B', lat: 37.5651, lng: 126.9895 },
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];
}

