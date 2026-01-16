import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { Flight } from '@prisma/client';

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) {}

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    return this.prisma.flight.create({
      data: {
        flightNumber: createFlightDto.flightNumber,
        origin: createFlightDto.origin,
        destination: createFlightDto.destination,
        departureTime: new Date(createFlightDto.departureTime),
        price: createFlightDto.price,
        totalSeats: createFlightDto.totalSeats,
      },
    });
  }

  async findAll(): Promise<Flight[]> {
    return this.prisma.flight.findMany({
      orderBy: {
        departureTime: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Flight> {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    return flight;
  }

  async update(id: number, updateFlightDto: UpdateFlightDto): Promise<Flight> {
    // Sprawdź czy lot istnieje
    await this.findOne(id);

    const updateData: {
      flightNumber?: string;
      origin?: string;
      destination?: string;
      departureTime?: Date;
      price?: number;
      totalSeats?: number;
    } = {};

    if (updateFlightDto.flightNumber)
      updateData.flightNumber = updateFlightDto.flightNumber;
    if (updateFlightDto.origin) updateData.origin = updateFlightDto.origin;
    if (updateFlightDto.destination)
      updateData.destination = updateFlightDto.destination;
    if (updateFlightDto.departureTime)
      updateData.departureTime = new Date(updateFlightDto.departureTime);
    if (updateFlightDto.price !== undefined)
      updateData.price = updateFlightDto.price;
    if (updateFlightDto.totalSeats !== undefined)
      updateData.totalSeats = updateFlightDto.totalSeats;

    return this.prisma.flight.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number): Promise<Flight> {
    // Sprawdź czy lot istnieje
    await this.findOne(id);

    return this.prisma.flight.delete({
      where: { id },
    });
  }
}
