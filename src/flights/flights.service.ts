import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { Flight } from '@prisma/client';

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) {}

  create(_createFlightDto: CreateFlightDto) {
    return 'This action adds a new flight';
  }

  async findAll(): Promise<Flight[]> {
    return this.prisma.flight.findMany();
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
