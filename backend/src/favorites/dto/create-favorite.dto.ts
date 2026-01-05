import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateFavoriteDto {
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
}

