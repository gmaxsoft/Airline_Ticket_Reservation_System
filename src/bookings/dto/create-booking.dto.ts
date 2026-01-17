import { IsNotEmpty, IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID lotu',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  flightId: number;

  @ApiProperty({
    description: 'Numer miejsca',
    example: '12A',
  })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;
}
