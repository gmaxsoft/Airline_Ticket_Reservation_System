import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    fullName: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockSafeUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockPrismaService = {
    user: {
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
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt123');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    it('should create a user with hashed password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockSafeUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockSafeUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        'salt123',
      );
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: 'hashedPassword123',
          fullName: createUserDto.fullName,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    it('should throw ConflictException if user with email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [mockSafeUser, { ...mockSafeUser, id: 2 }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array if no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockSafeUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSafeUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email with password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      fullName: 'Updated Name',
    };

    beforeEach(() => {
      // Reset mock implementation before each test
      mockPrismaService.user.findUnique.mockReset();
    });

    it('should update a user', async () => {
      // Mock findUnique: first call with id and select returns user, second with email returns null
      mockPrismaService.user.findUnique
        .mockImplementationOnce(() => Promise.resolve(mockSafeUser))
        .mockImplementationOnce(() => Promise.resolve(null));
      mockPrismaService.user.update.mockResolvedValue({
        ...mockSafeUser,
        fullName: 'Updated Name',
      });

      const result = await service.update(1, updateUserDto);

      expect(result.fullName).toBe('Updated Name');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fullName: 'Updated Name' },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    it('should hash password when updating password', async () => {
      const updateDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      // Mock findUnique: first call (findOne) returns user, second (email check) won't be called
      mockPrismaService.user.findUnique.mockImplementationOnce(() =>
        Promise.resolve(mockSafeUser),
      );
      mockPrismaService.user.update.mockResolvedValue(mockSafeUser);

      await service.update(1, updateDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt123');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashedPassword123' },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Mock findUnique to return null for findOne call
      mockPrismaService.user.findUnique.mockImplementationOnce(() =>
        Promise.resolve(null),
      );

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already taken by another user', async () => {
      const updateDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      // Mock findUnique: first call (findOne with id) returns user, second (email check) returns different user
      mockPrismaService.user.findUnique
        .mockImplementationOnce(() => Promise.resolve(mockSafeUser))
        .mockImplementationOnce(() => Promise.resolve({ ...mockUser, id: 2 }));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        new ConflictException('User with this email already exists'),
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should allow updating email to same email', async () => {
      const updateDto: UpdateUserDto = {
        email: 'test@example.com',
      };

      // Mock findUnique: first call (findOne) returns user, second (email check) returns same user
      mockPrismaService.user.findUnique
        .mockImplementationOnce(() => Promise.resolve(mockSafeUser))
        .mockImplementationOnce(() => Promise.resolve(mockUser));
      mockPrismaService.user.update.mockResolvedValue(mockSafeUser);

      await service.update(1, updateDto);

      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      // findOne uses findUnique with select

      mockPrismaService.user.findUnique.mockImplementation((args: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (args?.where?.id === 1) {
          return Promise.resolve(mockSafeUser);
        }
        return Promise.resolve(null);
      });
      mockPrismaService.user.delete.mockResolvedValue(mockSafeUser);

      const result = await service.remove(1);

      expect(result).toEqual(mockSafeUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // findOne uses findUnique with select

      mockPrismaService.user.findUnique.mockImplementation((args: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (args?.where?.id === 999) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });
});
