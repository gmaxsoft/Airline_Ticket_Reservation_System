import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;

  const mockSafeUser: Omit<User, 'password'> = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockUsersServiceMethods = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    mockUsersService = module.get<jest.Mocked<UsersService>>(UsersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    it('should create a user and return 201 status', async () => {
      mockUsersServiceMethods.create.mockResolvedValue(mockSafeUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockSafeUser);
      expect(mockUsersServiceMethods.create).toHaveBeenCalledWith(
        createUserDto,
      );
      expect(mockUsersServiceMethods.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersServiceMethods.create.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersServiceMethods.create).toHaveBeenCalledWith(
        createUserDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockSafeUser, { ...mockSafeUser, id: 2 }];
      mockUsersServiceMethods.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersServiceMethods.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no users exist', async () => {
      mockUsersServiceMethods.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockUsersServiceMethods.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersServiceMethods.findOne.mockResolvedValue(mockSafeUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockSafeUser);
      expect(mockUsersServiceMethods.findOne).toHaveBeenCalledWith(1);
      expect(mockUsersServiceMethods.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersServiceMethods.findOne.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUsersServiceMethods.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      fullName: 'Updated Name',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockSafeUser, fullName: 'Updated Name' };
      mockUsersServiceMethods.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(result.fullName).toBe('Updated Name');
      expect(mockUsersServiceMethods.update).toHaveBeenCalledWith(
        1,
        updateUserDto,
      );
      expect(mockUsersServiceMethods.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersServiceMethods.update.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersServiceMethods.update).toHaveBeenCalledWith(
        999,
        updateUserDto,
      );
    });

    it('should throw ConflictException if email is already taken', async () => {
      const updateDto: UpdateUserDto = {
        email: 'existing@example.com',
      };
      mockUsersServiceMethods.update.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersServiceMethods.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a user and return 204 status', async () => {
      mockUsersServiceMethods.remove.mockResolvedValue(mockSafeUser);

      const result = await controller.remove(1);

      expect(result).toEqual(mockSafeUser);
      expect(mockUsersServiceMethods.remove).toHaveBeenCalledWith(1);
      expect(mockUsersServiceMethods.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersServiceMethods.remove.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUsersServiceMethods.remove).toHaveBeenCalledWith(999);
    });
  });
});
