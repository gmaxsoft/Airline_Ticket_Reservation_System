import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Booking } from '@prisma/client';

@ApiTags('Rezerwacje')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
@UseGuards(JwtAuthGuard) // Zabezpiecza wszystkie endpointy w kontrolerze
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Utworzenie nowej rezerwacji' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: 'Rezerwacja została pomyślnie utworzona',
  })
  @ApiResponse({
    status: 400,
    description: 'Nieprawidłowe dane',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak autoryzacji',
  })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Pobierz userId z tokena JWT (z request.user)
    return this.bookingsService.create(createBookingDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Pobranie listy wszystkich rezerwacji' })
  @ApiResponse({
    status: 200,
    description: 'Lista rezerwacji',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak autoryzacji',
  })
  async findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Pobranie rezerwacji zalogowanego użytkownika' })
  @ApiResponse({
    status: 200,
    description: 'Lista rezerwacji użytkownika',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak autoryzacji',
  })
  async findMyBookings(
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking[]> {
    // Pobierz rezerwacje zalogowanego użytkownika
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobranie rezerwacji po ID' })
  @ApiParam({ name: 'id', description: 'ID rezerwacji', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Szczegóły rezerwacji',
  })
  @ApiResponse({
    status: 404,
    description: 'Rezerwacja nie została znaleziona',
  })
  @ApiResponse({
    status: 403,
    description: 'Brak dostępu do tej rezerwacji',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak autoryzacji',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Sprawdź czy użytkownik ma dostęp do tej rezerwacji
    return this.bookingsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aktualizacja rezerwacji' })
  @ApiParam({ name: 'id', description: 'ID rezerwacji', type: Number })
  @ApiBody({ type: UpdateBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Rezerwacja została zaktualizowana',
  })
  @ApiResponse({
    status: 404,
    description: 'Rezerwacja nie została znaleziona',
  })
  @ApiResponse({
    status: 403,
    description: 'Brak uprawnień do aktualizacji tej rezerwacji',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak autoryzacji',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Tylko właściciel rezerwacji może ją aktualizować
    return this.bookingsService.update(id, updateBookingDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usunięcie rezerwacji' })
  @ApiParam({ name: 'id', description: 'ID rezerwacji', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Rezerwacja została usunięta',
  })
  @ApiResponse({
    status: 404,
    description: 'Rezerwacja nie została znaleziona',
  })
  @ApiResponse({
    status: 403,
    description: 'Brak uprawnień do usunięcia tej rezerwacji',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak autoryzacji',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Tylko właściciel rezerwacji może ją usunąć
    return this.bookingsService.remove(id, req.user.userId);
  }
}
