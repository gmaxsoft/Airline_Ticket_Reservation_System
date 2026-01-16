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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Booking } from '@prisma/client';

@Controller('bookings')
@UseGuards(JwtAuthGuard) // Zabezpiecza wszystkie endpointy w kontrolerze
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Pobierz userId z tokena JWT (z request.user)
    return this.bookingsService.create(createBookingDto, req.user.userId);
  }

  @Get()
  async findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Get('my')
  async findMyBookings(
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking[]> {
    // Pobierz rezerwacje zalogowanego użytkownika
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Sprawdź czy użytkownik ma dostęp do tej rezerwacji
    return this.bookingsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
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
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<Booking> {
    // Tylko właściciel rezerwacji może ją usunąć
    return this.bookingsService.remove(id, req.user.userId);
  }
}
