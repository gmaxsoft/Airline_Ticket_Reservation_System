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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { Flight } from '@prisma/client';

@ApiTags('Loty')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Utworzenie nowego lotu' })
  @ApiBody({ type: CreateFlightDto })
  @ApiResponse({
    status: 201,
    description: 'Lot został pomyślnie utworzony',
  })
  @ApiResponse({
    status: 400,
    description: 'Nieprawidłowe dane',
  })
  async create(@Body() createFlightDto: CreateFlightDto): Promise<Flight> {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobranie listy wszystkich lotów' })
  @ApiResponse({
    status: 200,
    description: 'Lista lotów',
  })
  async findAll(): Promise<Flight[]> {
    return this.flightsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobranie lotu po ID' })
  @ApiParam({ name: 'id', description: 'ID lotu', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Szczegóły lotu',
  })
  @ApiResponse({
    status: 404,
    description: 'Lot nie został znaleziony',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return this.flightsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aktualizacja lotu' })
  @ApiParam({ name: 'id', description: 'ID lotu', type: Number })
  @ApiBody({ type: UpdateFlightDto })
  @ApiResponse({
    status: 200,
    description: 'Lot został zaktualizowany',
  })
  @ApiResponse({
    status: 404,
    description: 'Lot nie został znaleziony',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<Flight> {
    return this.flightsService.update(id, updateFlightDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usunięcie lotu' })
  @ApiParam({ name: 'id', description: 'ID lotu', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Lot został usunięty',
  })
  @ApiResponse({
    status: 404,
    description: 'Lot nie został znaleziony',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return this.flightsService.remove(id);
  }
}
