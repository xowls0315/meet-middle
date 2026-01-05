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

class ParticipantMinimalDto {
  @IsString()
  label: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

class PlaceMinimalDto {
  @IsString()
  placeId: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsString()
  placeUrl?: string;

  @IsOptional()
  @IsNumber()
  distance?: number;
}

class ShareDataDto {
  @IsObject()
  anchor: {
    lat: number;
    lng: number;
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantMinimalDto)
  participants: ParticipantMinimalDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => PlaceMinimalDto)
  final: PlaceMinimalDto;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PlaceMinimalDto)
  candidates: PlaceMinimalDto[];

  @IsOptional()
  @IsObject()
  used?: {
    category: string;
    radius: number;
  };
}

export class CreateShareDto {
  @ValidateNested()
  @Type(() => ShareDataDto)
  data: ShareDataDto;
}

