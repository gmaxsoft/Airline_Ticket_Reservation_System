import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsDateString() // Sprawdza, czy format daty jest poprawny (ISO 8601)
  departureTime: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  totalSeats: number;
}
