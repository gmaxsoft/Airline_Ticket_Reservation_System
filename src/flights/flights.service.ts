import { Injectable } from '@nestjs/common';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';

@Injectable()
export class FlightsService {
  create(_createFlightDto: CreateFlightDto) {
    return 'This action adds a new flight';
  }

  findAll() {
    return `This action returns all flights`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flight`;
  }

  update(id: number, _updateFlightDto: UpdateFlightDto) {
    return `This action updates a #${id} flight`;
  }

  remove(id: number) {
    return `This action removes a #${id} flight`;
  }
}
