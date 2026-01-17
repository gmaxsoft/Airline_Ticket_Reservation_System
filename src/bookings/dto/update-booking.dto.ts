import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional({
    description: 'Status rezerwacji',
    example: 'confirmed',
    enum: ['confirmed', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['confirmed', 'cancelled'], {
    message: 'Status must be either "confirmed" or "cancelled"',
  })
  status?: string;
}
