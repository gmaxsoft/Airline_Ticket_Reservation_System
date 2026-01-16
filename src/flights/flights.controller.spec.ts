import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { Flight } from '@prisma/client';

describe('FlightsController', () => {
  let controller: FlightsController;

  const mockFlight: Flight = {
    id: 1,
    flightNumber: 'AA123',
    origin: 'WAW',
    destination: 'JFK',
    departureTime: new Date('2024-12-25T10:00:00Z'),
    price: 500.0,
    totalSeats: 200,
  };

  const mockFlightsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightsController],
      providers: [
        {
          provide: FlightsService,
          useValue: mockFlightsService,
        },
      ],
    }).compile();

    controller = module.get<FlightsController>(FlightsController);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a flight and return it', async () => {
      const createFlightDto: CreateFlightDto = {
        flightNumber: 'AA123',
        origin: 'WAW',
        destination: 'JFK',
        departureTime: '2024-12-25T10:00:00Z',
        price: 500.0,
        totalSeats: 200,
      };

      mockFlightsService.create.mockResolvedValue(mockFlight);

      const result = await controller.create(createFlightDto);

      expect(result).toEqual(mockFlight);
      expect(mockFlightsService.create).toHaveBeenCalledWith(createFlightDto);
      expect(mockFlightsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of flights', async () => {
      const mockFlights: Flight[] = [
        mockFlight,
        {
          ...mockFlight,
          id: 2,
          flightNumber: 'BB456',
        },
      ];

      mockFlightsService.findAll.mockResolvedValue(mockFlights);

      const result = await controller.findAll();

      expect(result).toEqual(mockFlights);
      expect(mockFlightsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no flights exist', async () => {
      mockFlightsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a flight by id', async () => {
      mockFlightsService.findOne.mockResolvedValue(mockFlight);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockFlight);
      expect(mockFlightsService.findOne).toHaveBeenCalledWith(1);
      expect(mockFlightsService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      mockFlightsService.findOne.mockRejectedValue(
        new NotFoundException('Flight with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockFlightsService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a flight and return it', async () => {
      const updateFlightDto: UpdateFlightDto = {
        price: 600.0,
      };

      const updatedFlight = {
        ...mockFlight,
        price: 600.0,
      };

      mockFlightsService.update.mockResolvedValue(updatedFlight);

      const result = await controller.update(1, updateFlightDto);

      expect(result).toEqual(updatedFlight);
      expect(mockFlightsService.update).toHaveBeenCalledWith(
        1,
        updateFlightDto,
      );
      expect(mockFlightsService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating non-existent flight', async () => {
      const updateFlightDto: UpdateFlightDto = { price: 600.0 };

      mockFlightsService.update.mockRejectedValue(
        new NotFoundException('Flight with ID 999 not found'),
      );

      await expect(controller.update(999, updateFlightDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a flight and return it', async () => {
      mockFlightsService.remove.mockResolvedValue(mockFlight);

      const result = await controller.remove(1);

      expect(result).toEqual(mockFlight);
      expect(mockFlightsService.remove).toHaveBeenCalledWith(1);
      expect(mockFlightsService.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when deleting non-existent flight', async () => {
      mockFlightsService.remove.mockRejectedValue(
        new NotFoundException('Flight with ID 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockFlightsService.remove).toHaveBeenCalledWith(999);
    });
  });
});
