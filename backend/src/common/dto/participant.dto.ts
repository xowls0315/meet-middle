import { IsString, IsNumber, IsIn, Min, Max } from 'class-validator';

export class ParticipantDto {
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  label: string;

  @IsString()
  query: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  selectedPlace?: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
  };
}

