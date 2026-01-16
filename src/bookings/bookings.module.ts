import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Import AuthModule aby mieć dostęp do JwtAuthGuard
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
