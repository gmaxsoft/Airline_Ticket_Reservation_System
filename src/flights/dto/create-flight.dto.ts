import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty({
    description: 'Numer lotu',
    example: 'LH401',
  })
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @ApiProperty({
    description: 'Lotnisko wylotu',
    example: 'Warszawa',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({
    description: 'Lotnisko przylotu',
    example: 'Berlin',
  })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({
    description: 'Data i godzina wylotu (format ISO 8601)',
    example: '2024-12-25T10:00:00Z',
  })
  @IsDateString() // Sprawdza, czy format daty jest poprawny (ISO 8601)
  departureTime: string;

  @ApiProperty({
    description: 'Cena biletu',
    example: 299.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Całkowita liczba miejsc',
    example: 180,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  totalSeats: number;
}
