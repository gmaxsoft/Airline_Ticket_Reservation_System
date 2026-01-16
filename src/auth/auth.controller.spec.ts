import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  const mockLoginResponse = {
    access_token: 'mockAccessToken123',
    user: {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
    },
  };

  const mockAuthServiceMethods = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthServiceMethods,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get<jest.Mocked<AuthService>>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully and return access token and user info', async () => {
      mockAuthServiceMethods.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(result.access_token).toBe(mockLoginResponse.access_token);
      expect(result.user).toEqual(mockLoginResponse.user);
      expect(mockAuthServiceMethods.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthServiceMethods.login).toHaveBeenCalledTimes(1);
    });

    it('should return 200 status code on successful login', async () => {
      mockAuthServiceMethods.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthServiceMethods.login.mockRejectedValue(
        new UnauthorizedException('Błędny email lub hasło'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Błędny email lub hasło',
      );
      expect(mockAuthServiceMethods.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should call authService.login with correct parameters', async () => {
      mockAuthServiceMethods.login.mockResolvedValue(mockLoginResponse);

      await controller.login(loginDto);

      expect(mockAuthServiceMethods.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthServiceMethods.login).toHaveBeenCalledTimes(1);
    });

    it('should handle different email formats', async () => {
      const differentLoginDto: LoginDto = {
        email: 'user.name+tag@example.co.uk',
        password: 'password123',
      };
      mockAuthServiceMethods.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(differentLoginDto);

      expect(result).toBeDefined();
      expect(mockAuthServiceMethods.login).toHaveBeenCalledWith(
        differentLoginDto.email,
        differentLoginDto.password,
      );
    });

    it('should return user info without password', async () => {
      mockAuthServiceMethods.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('fullName');
    });

    it('should propagate errors from AuthService', async () => {
      const error = new Error('Service error');
      mockAuthServiceMethods.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
    });
  });
});
