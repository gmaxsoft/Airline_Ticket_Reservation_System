import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Booking } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: number,
  ): Promise<Booking> {
    // Sprawdź czy lot istnieje
    const flight = await this.prisma.flight.findUnique({
      where: { id: createBookingDto.flightId },
    });

    if (!flight) {
      throw new NotFoundException(
        `Flight with ID ${createBookingDto.flightId} not found`,
      );
    }

    // Sprawdź czy użytkownik istnieje
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Sprawdź ile miejsc jest już zarezerwowanych dla tego lotu
    const existingBookings = await this.prisma.booking.count({
      where: {
        flightId: createBookingDto.flightId,
        status: 'confirmed', // Tylko potwierdzone rezerwacje liczą się do dostępności
      },
    });

    // Sprawdź czy nie ma overbookingu
    if (existingBookings >= flight.totalSeats) {
      throw new BadRequestException(
        `No available seats for flight ${flight.flightNumber}. All ${flight.totalSeats} seats are already booked.`,
      );
    }

    // Sprawdź czy miejsce nie jest już zarezerwowane
    const existingSeatBooking = await this.prisma.booking.findFirst({
      where: {
        flightId: createBookingDto.flightId,
        seatNumber: createBookingDto.seatNumber,
        status: 'confirmed',
      },
    });

    if (existingSeatBooking) {
      throw new BadRequestException(
        `Seat ${createBookingDto.seatNumber} is already booked for this flight.`,
      );
    }

    // Sprawdź czy użytkownik nie ma już rezerwacji na ten lot
    const userBookingForFlight = await this.prisma.booking.findFirst({
      where: {
        userId: userId,
        flightId: createBookingDto.flightId,
        status: 'confirmed',
      },
    });

    if (userBookingForFlight) {
      throw new BadRequestException(
        `You already have a confirmed booking for this flight.`,
      );
    }

    // Utwórz rezerwację
    const booking = await this.prisma.booking.create({
      data: {
        flightId: createBookingDto.flightId,
        userId: userId,
        seatNumber: createBookingDto.seatNumber,
        status: 'confirmed',
      },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
    });

    return booking;
  }

  async findAll(): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });
  }

  async findMyBookings(userId: number): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        userId: userId,
      },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });
  }

  async findOne(id: number, userId?: number): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Jeśli userId jest podane, sprawdź czy użytkownik ma dostęp do tej rezerwacji
    if (userId && booking.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this booking',
      );
    }

    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
    userId: number,
  ): Promise<Booking> {
    // Sprawdź czy rezerwacja istnieje i czy użytkownik ma do niej dostęp
    const existingBooking = await this.findOne(id, userId);

    // Jeśli status jest aktualizowany na 'cancelled', sprawdź czy można anulować
    if (updateBookingDto.status === 'cancelled') {
      // Można anulować tylko potwierdzone rezerwacje
      if (existingBooking.status !== 'confirmed') {
        throw new BadRequestException(
          `Cannot cancel booking with status ${existingBooking.status}`,
        );
      }
    }

    // Jeśli seatNumber jest aktualizowane, sprawdź czy nowe miejsce jest dostępne
    if (updateBookingDto.seatNumber) {
      const existingSeatBooking = await this.prisma.booking.findFirst({
        where: {
          flightId: existingBooking.flightId,
          seatNumber: updateBookingDto.seatNumber,
          status: 'confirmed',
          id: {
            not: id, // Wyklucz aktualną rezerwację
          },
        },
      });

      if (existingSeatBooking) {
        throw new BadRequestException(
          `Seat ${updateBookingDto.seatNumber} is already booked for this flight.`,
        );
      }
    }

    // Aktualizuj rezerwację
    const booking = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
    });

    return booking;
  }

  async remove(id: number, userId: number): Promise<Booking> {
    // Sprawdź czy rezerwacja istnieje i czy użytkownik ma do niej dostęp
    await this.findOne(id, userId);

    return this.prisma.booking.delete({
      where: { id },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
    });
  }

  // Metoda pomocnicza do sprawdzania dostępności miejsc
  async getAvailableSeats(flightId: number): Promise<number> {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${flightId} not found`);
    }

    const bookedSeats = await this.prisma.booking.count({
      where: {
        flightId: flightId,
        status: 'confirmed',
      },
    });

    return flight.totalSeats - bookedSeats;
  }
}
