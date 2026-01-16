import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from '@prisma/client';

describe('BookingsController', () => {
  let controller: BookingsController;

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
    flight: {
      id: 1,
      flightNumber: 'LO001',
      origin: 'WAW',
      destination: 'JFK',
      departureTime: new Date('2024-12-25T10:00:00Z'),
      price: 2500.0,
      totalSeats: 200,
    },
    user: {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    },
  };

  const mockRequest = {
    user: {
      userId: 1,
      email: 'test@example.com',
    },
  };

  const mockBookingsServiceMethods = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMyBookings: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsServiceMethods,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      flightId: 1,
      seatNumber: '12A',
    };

    it('should create a booking and return 201 status', async () => {
      mockBookingsServiceMethods.create.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await controller.create(createBookingDto, mockRequest);

      expect(result).toEqual(mockBookingWithRelations);
      expect(mockBookingsServiceMethods.create).toHaveBeenCalledWith(
        createBookingDto,
        mockRequest.user.userId,
      );
      expect(mockBookingsServiceMethods.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if flight does not exist', async () => {
      mockBookingsServiceMethods.create.mockRejectedValue(
        new NotFoundException('Flight with ID 1 not found'),
      );

      await expect(
        controller.create(createBookingDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(mockBookingsServiceMethods.create).toHaveBeenCalledWith(
        createBookingDto,
        mockRequest.user.userId,
      );
    });

    it('should throw BadRequestException if overbooking occurs', async () => {
      mockBookingsServiceMethods.create.mockRejectedValue(
        new BadRequestException('No available seats'),
      );

      await expect(
        controller.create(createBookingDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const bookings = [mockBookingWithRelations];
      mockBookingsServiceMethods.findAll.mockResolvedValue(bookings);

      const result = await controller.findAll();

      expect(result).toEqual(bookings);
      expect(mockBookingsServiceMethods.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no bookings exist', async () => {
      mockBookingsServiceMethods.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findMyBookings', () => {
    it('should return bookings for logged-in user', async () => {
      const bookings = [mockBookingWithRelations];
      mockBookingsServiceMethods.findMyBookings.mockResolvedValue(bookings);

      const result = await controller.findMyBookings(mockRequest);

      expect(result).toEqual(bookings);
      expect(mockBookingsServiceMethods.findMyBookings).toHaveBeenCalledWith(
        mockRequest.user.userId,
      );
      expect(mockBookingsServiceMethods.findMyBookings).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should return empty array if user has no bookings', async () => {
      mockBookingsServiceMethods.findMyBookings.mockResolvedValue([]);

      const result = await controller.findMyBookings(mockRequest);

      expect(result).toEqual([]);
      expect(mockBookingsServiceMethods.findMyBookings).toHaveBeenCalledWith(
        mockRequest.user.userId,
      );
    });
  });

  describe('findOne', () => {
    it('should return booking by id', async () => {
      mockBookingsServiceMethods.findOne.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await controller.findOne(1, mockRequest);

      expect(result).toEqual(mockBookingWithRelations);
      expect(mockBookingsServiceMethods.findOne).toHaveBeenCalledWith(
        1,
        mockRequest.user.userId,
      );
      expect(mockBookingsServiceMethods.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingsServiceMethods.findOne.mockRejectedValue(
        new NotFoundException('Booking with ID 999 not found'),
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBookingsServiceMethods.findOne).toHaveBeenCalledWith(
        999,
        mockRequest.user.userId,
      );
    });

    it('should throw ForbiddenException if user tries to access other user booking', async () => {
      mockBookingsServiceMethods.findOne.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to access this booking',
        ),
      );

      await expect(controller.findOne(1, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const updateBookingDto: UpdateBookingDto = {
      status: 'cancelled',
    };

    it('should update booking successfully', async () => {
      const updatedBooking = {
        ...mockBookingWithRelations,
        status: 'cancelled',
      };
      mockBookingsServiceMethods.update.mockResolvedValue(updatedBooking);

      const result = await controller.update(1, updateBookingDto, mockRequest);

      expect(result).toEqual(updatedBooking);
      expect(result.status).toBe('cancelled');
      expect(mockBookingsServiceMethods.update).toHaveBeenCalledWith(
        1,
        updateBookingDto,
        mockRequest.user.userId,
      );
      expect(mockBookingsServiceMethods.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingsServiceMethods.update.mockRejectedValue(
        new NotFoundException('Booking with ID 999 not found'),
      );

      await expect(
        controller.update(999, updateBookingDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(mockBookingsServiceMethods.update).toHaveBeenCalledWith(
        999,
        updateBookingDto,
        mockRequest.user.userId,
      );
    });

    it('should throw ForbiddenException if user does not own booking', async () => {
      mockBookingsServiceMethods.update.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to access this booking',
        ),
      );

      await expect(
        controller.update(1, updateBookingDto, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if trying to cancel non-confirmed booking', async () => {
      mockBookingsServiceMethods.update.mockRejectedValue(
        new BadRequestException('Cannot cancel booking with status cancelled'),
      );

      await expect(
        controller.update(1, updateBookingDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete booking and return 204 status', async () => {
      mockBookingsServiceMethods.remove.mockResolvedValue(
        mockBookingWithRelations,
      );

      const result = await controller.remove(1, mockRequest);

      expect(result).toEqual(mockBookingWithRelations);
      expect(mockBookingsServiceMethods.remove).toHaveBeenCalledWith(
        1,
        mockRequest.user.userId,
      );
      expect(mockBookingsServiceMethods.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingsServiceMethods.remove.mockRejectedValue(
        new NotFoundException('Booking with ID 999 not found'),
      );

      await expect(controller.remove(999, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBookingsServiceMethods.remove).toHaveBeenCalledWith(
        999,
        mockRequest.user.userId,
      );
    });

    it('should throw ForbiddenException if user does not own booking', async () => {
      mockBookingsServiceMethods.remove.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to access this booking',
        ),
      );

      await expect(controller.remove(1, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
