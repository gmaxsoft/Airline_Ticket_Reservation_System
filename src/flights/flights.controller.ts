import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { Flight } from '@prisma/client';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFlightDto: CreateFlightDto): Promise<Flight> {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  async findAll(): Promise<Flight[]> {
    return this.flightsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return this.flightsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<Flight> {
    return this.flightsService.update(id, updateFlightDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return this.flightsService.remove(id);
  }
}
