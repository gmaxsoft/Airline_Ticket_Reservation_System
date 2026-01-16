import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';

@Module({
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
