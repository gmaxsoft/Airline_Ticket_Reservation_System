import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    fullName: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockUsersServiceMethods = {
    findByEmail: jest.fn(),
  };

  const mockJwtServiceMethods = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
        {
          provide: JwtService,
          useValue: mockJwtServiceMethods,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const accessToken = 'mockAccessToken123';

    it('should login successfully with valid credentials', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtServiceMethods.signAsync.mockResolvedValue(accessToken);

      const result = await service.login(email, password);

      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
        },
      });
      expect(mockUsersServiceMethods.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUsersServiceMethods.findByEmail).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(mockJwtServiceMethods.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(mockJwtServiceMethods.signAsync).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Błędny email lub hasło',
      );
      expect(mockUsersServiceMethods.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtServiceMethods.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Błędny email lub hasło',
      );
      expect(mockUsersServiceMethods.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(mockJwtServiceMethods.signAsync).not.toHaveBeenCalled();
    });

    it('should generate JWT token with correct payload', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtServiceMethods.signAsync.mockResolvedValue(accessToken);

      await service.login(email, password);

      expect(mockJwtServiceMethods.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should return user info without password', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtServiceMethods.signAsync.mockResolvedValue(accessToken);

      const result = await service.login(email, password);

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
      });
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('createdAt');
    });

    it('should handle bcrypt comparison errors', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt comparison error'),
      );

      await expect(service.login(email, password)).rejects.toThrow(
        'Bcrypt comparison error',
      );
      expect(mockJwtServiceMethods.signAsync).not.toHaveBeenCalled();
    });

    it('should handle JWT signing errors', async () => {
      mockUsersServiceMethods.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtServiceMethods.signAsync.mockRejectedValue(
        new Error('JWT signing error'),
      );

      await expect(service.login(email, password)).rejects.toThrow(
        'JWT signing error',
      );
    });
  });
});
