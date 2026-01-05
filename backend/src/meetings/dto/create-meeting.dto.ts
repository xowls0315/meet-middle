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

class FinalPlaceDto {
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

  @IsString()
  placeUrl: string;

  @IsNumber()
  @Min(0)
  distance?: number;
}

export class CreateMeetingDto {
  @IsObject()
  @ValidateNested()
  @Type(() => FinalPlaceDto)
  final: FinalPlaceDto;

  @IsNumber()
  @IsIn([2, 3, 4])
  participantCount: number;
}

