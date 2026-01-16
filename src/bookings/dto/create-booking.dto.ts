import { IsNotEmpty, IsInt, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  flightId: number;

  @IsString()
  @IsNotEmpty()
  seatNumber: string;
}
