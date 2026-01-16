import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, Flight, User } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockFlight: Flight = {
    id: 1,
    flightNumber: 'LO001',
    origin: 'WAW',
    destination: 'JFK',
    departureTime: new Date('2024-12-25T10:00:00Z'),
    price: 2500.0,
    totalSeats: 200,
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockBooking: Booking = {
    id: 1,
    flightId: 1,
    userId: 1,
    seatNumber: '12A',
    status: 'confirmed',
    bookingDate: new Date('2024-12-20T10:00:00Z'),
  };

  const mockBookingWithRelations = {
    ...mockBooking,
    flight: mockFlight,
    user: {
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      createdAt: mockUser.createdAt,
    },
  };

  const mockPrismaService = {
    flight: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      flightId: 1,
      seatNumber: '12A',
    };
    const userId = 1;

    it('should create a booking successfully', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.count.mockResolvedValue(0); // No existing bookings
      mockPrismaService.booking.findFirst
        .mockResolvedValueOnce(null) // No existing seat booking
        .mockResolvedValueOnce(null); // No user booking for flight
      mockPrismaService.booking.create.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await service.create(createBookingDto, userId);

      expect(result).toEqual(mockBookingWithRelations);
      expect(mockPrismaService.flight.findUnique).toHaveBeenCalledWith({
        where: { id: createBookingDto.flightId },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.booking.count).toHaveBeenCalledWith({
        where: {
          flightId: createBookingDto.flightId,
          status: 'confirmed',
        },
      });
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
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
    });

    it('should throw NotFoundException if flight does not exist', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(null);

      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        `Flight with ID ${createBookingDto.flightId} not found`,
      );
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        `User with ID ${userId} not found`,
      );
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if all seats are booked (overbooking)', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.count.mockResolvedValue(200); // All seats booked

      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        'No available seats',
      );
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if seat is already booked', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.count.mockResolvedValue(0);
      // findFirst is called twice in create() - first for seat check, second for user check
      // First call should return booking (seat already booked)

      mockPrismaService.booking.findFirst.mockImplementation((args: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (args?.where?.seatNumber === createBookingDto.seatNumber) {
          return Promise.resolve(mockBooking); // Seat already booked
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        `Seat ${createBookingDto.seatNumber} is already booked`,
      );
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already has booking for this flight', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.count.mockResolvedValue(0);
      // findFirst is called twice in create() - first for seat check, second for user check
      // First call should return null (seat available), second should return booking (user has booking)
      let callCount = 0;

      mockPrismaService.booking.findFirst.mockImplementation((args: any) => {
        callCount++;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (args?.where?.seatNumber === createBookingDto.seatNumber) {
          return Promise.resolve(null); // Seat available
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (args?.where?.userId === userId) {
          return Promise.resolve(mockBooking); // User already has booking
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        'You already have a confirmed booking for this flight',
      );
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const bookings = [mockBookingWithRelations];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);

      const result = await service.findAll();

      expect(result).toEqual(bookings);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
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
    });

    it('should return empty array if no bookings exist', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findMyBookings', () => {
    const userId = 1;

    it('should return bookings for specific user', async () => {
      const bookings = [mockBookingWithRelations];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);

      const result = await service.findMyBookings(userId);

      expect(result).toEqual(bookings);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
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
    });

    it('should return empty array if user has no bookings', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      const result = await service.findMyBookings(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return booking by id without userId check', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockBookingWithRelations);
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it('should return booking by id with userId check if user owns booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockBookingWithRelations);
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Booking with ID 999 not found',
      );
    });

    it('should throw ForbiddenException if user tries to access other user booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        mockBookingWithRelations,
      );

      await expect(service.findOne(1, 2)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne(1, 2)).rejects.toThrow(
        'You do not have permission to access this booking',
      );
    });
  });

  describe('update', () => {
    const updateBookingDto: UpdateBookingDto = {
      status: 'cancelled',
    };
    const userId = 1;

    beforeEach(() => {
      // Mock findOne to return booking
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockBookingWithRelations as Booking);
    });

    it('should update booking successfully', async () => {
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBookingWithRelations,
        status: 'cancelled',
      });

      const result = await service.update(1, updateBookingDto, userId);

      expect(result.status).toBe('cancelled');
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it('should throw BadRequestException if trying to cancel non-confirmed booking', async () => {
      const cancelledBooking = {
        ...mockBookingWithRelations,
        status: 'cancelled',
      };
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(cancelledBooking as Booking);

      await expect(service.update(1, updateBookingDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateBookingDto, userId)).rejects.toThrow(
        'Cannot cancel booking with status cancelled',
      );
    });

    it('should throw BadRequestException if new seat is already booked', async () => {
      const updateDto: UpdateBookingDto = {
        seatNumber: '13A',
      };
      mockPrismaService.booking.findFirst.mockResolvedValue(mockBooking); // Seat already booked

      await expect(service.update(1, updateDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateDto, userId)).rejects.toThrow(
        'Seat 13A is already booked',
      );
    });

    it('should allow updating seat if new seat is available', async () => {
      const updateDto: UpdateBookingDto = {
        seatNumber: '13A',
      };
      mockPrismaService.booking.findFirst.mockResolvedValue(null); // Seat available
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBookingWithRelations,
        seatNumber: '13A',
      });

      const result = await service.update(1, updateDto, userId);

      expect(result.seatNumber).toBe('13A');
      expect(mockPrismaService.booking.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const userId = 1;

    beforeEach(() => {
      // Mock findOne to return booking
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockBookingWithRelations as Booking);
    });

    it('should delete booking successfully', async () => {
      mockPrismaService.booking.delete.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await service.remove(1, userId);

      expect(result).toEqual(mockBookingWithRelations);
      expect(mockPrismaService.booking.delete).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it('should throw ForbiddenException if user does not own booking', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new ForbiddenException(
            'You do not have permission to access this booking',
          ),
        );

      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.booking.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableSeats', () => {
    it('should return available seats count', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.booking.count.mockResolvedValue(50); // 50 seats booked

      const result = await service.getAvailableSeats(1);

      expect(result).toBe(150); // 200 total - 50 booked = 150 available
      expect(mockPrismaService.flight.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.booking.count).toHaveBeenCalledWith({
        where: {
          flightId: 1,
          status: 'confirmed',
        },
      });
    });

    it('should throw NotFoundException if flight does not exist', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(null);

      await expect(service.getAvailableSeats(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getAvailableSeats(999)).rejects.toThrow(
        'Flight with ID 999 not found',
      );
    });

    it('should return 0 if all seats are booked', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.booking.count.mockResolvedValue(200); // All seats booked

      const result = await service.getAvailableSeats(1);

      expect(result).toBe(0);
    });
  });
});
