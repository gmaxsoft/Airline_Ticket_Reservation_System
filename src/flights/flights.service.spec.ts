import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { Flight } from '@prisma/client';

describe('FlightsService', () => {
  let service: FlightsService;

  const mockFlight: Flight = {
    id: 1,
    flightNumber: 'AA123',
    origin: 'WAW',
    destination: 'JFK',
    departureTime: new Date('2024-12-25T10:00:00Z'),
    price: 500.0,
    totalSeats: 200,
  };

  const mockPrismaService = {
    flight: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a flight', async () => {
      const createFlightDto: CreateFlightDto = {
        flightNumber: 'AA123',
        origin: 'WAW',
        destination: 'JFK',
        departureTime: '2024-12-25T10:00:00Z',
        price: 500.0,
        totalSeats: 200,
      };

      mockPrismaService.flight.create.mockResolvedValue(mockFlight);

      const result = await service.create(createFlightDto);

      expect(result).toEqual(mockFlight);
      expect(mockPrismaService.flight.create).toHaveBeenCalledWith({
        data: {
          flightNumber: createFlightDto.flightNumber,
          origin: createFlightDto.origin,
          destination: createFlightDto.destination,
          departureTime: new Date(createFlightDto.departureTime),
          price: createFlightDto.price,
          totalSeats: createFlightDto.totalSeats,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of flights ordered by departureTime', async () => {
      const mockFlights: Flight[] = [
        mockFlight,
        {
          ...mockFlight,
          id: 2,
          flightNumber: 'BB456',
          departureTime: new Date('2024-12-26T10:00:00Z'),
        },
      ];

      mockPrismaService.flight.findMany.mockResolvedValue(mockFlights);

      const result = await service.findAll();

      expect(result).toEqual(mockFlights);
      expect(mockPrismaService.flight.findMany).toHaveBeenCalledWith({
        orderBy: {
          departureTime: 'asc',
        },
      });
    });

    it('should return an empty array when no flights exist', async () => {
      mockPrismaService.flight.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a flight by id', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);

      const result = await service.findOne(1);

      expect(result).toEqual(mockFlight);
      expect(mockPrismaService.flight.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Flight with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a flight', async () => {
      const updateFlightDto: UpdateFlightDto = {
        price: 600.0,
        totalSeats: 250,
      };

      const updatedFlight = {
        ...mockFlight,
        price: 600.0,
        totalSeats: 250,
      };

      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.flight.update.mockResolvedValue(updatedFlight);

      const result = await service.update(1, updateFlightDto);

      expect(result).toEqual(updatedFlight);
      expect(mockPrismaService.flight.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          price: updateFlightDto.price,
          totalSeats: updateFlightDto.totalSeats,
        },
      });
    });

    it('should update flight with all fields', async () => {
      const updateFlightDto: UpdateFlightDto = {
        flightNumber: 'CC789',
        origin: 'LHR',
        destination: 'CDG',
        departureTime: '2024-12-27T14:00:00Z',
        price: 700.0,
        totalSeats: 300,
      };

      const updatedFlight = {
        ...mockFlight,
        ...updateFlightDto,
        departureTime: new Date(updateFlightDto.departureTime!),
      };

      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.flight.update.mockResolvedValue(updatedFlight);

      const result = await service.update(1, updateFlightDto);

      expect(result).toEqual(updatedFlight);
      expect(mockPrismaService.flight.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          flightNumber: updateFlightDto.flightNumber,
          origin: updateFlightDto.origin,
          destination: updateFlightDto.destination,
          departureTime: new Date(updateFlightDto.departureTime!),
          price: updateFlightDto.price,
          totalSeats: updateFlightDto.totalSeats,
        },
      });
    });

    it('should throw NotFoundException when updating non-existent flight', async () => {
      const updateFlightDto: UpdateFlightDto = { price: 600.0 };

      mockPrismaService.flight.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateFlightDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.flight.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a flight', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(mockFlight);
      mockPrismaService.flight.delete.mockResolvedValue(mockFlight);

      const result = await service.remove(1);

      expect(result).toEqual(mockFlight);
      expect(mockPrismaService.flight.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when deleting non-existent flight', async () => {
      mockPrismaService.flight.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.flight.delete).not.toHaveBeenCalled();
    });
  });
});
