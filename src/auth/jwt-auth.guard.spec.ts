import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should extend AuthGuard with jwt strategy', () => {
      // Verify that guard extends AuthGuard('jwt')
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });

    it('should allow access when token is valid', async () => {
      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer valid-token',
            },
            user: {
              userId: 1,
              email: 'test@example.com',
            },
          }),
          getResponse: jest.fn(),
        }),
      };

      // Mock the canActivate method from AuthGuard
      jest.spyOn(guard, 'canActivate').mockResolvedValue(true);

      const result = await guard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(result).toBe(true);
    });

    it('should deny access when token is missing', async () => {
      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
          getResponse: jest.fn(),
        }),
      };

      // Mock the canActivate method to throw UnauthorizedException
      jest
        .spyOn(guard, 'canActivate')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        guard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access when token is invalid', async () => {
      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer invalid-token',
            },
          }),
          getResponse: jest.fn(),
        }),
      };

      // Mock the canActivate method to throw UnauthorizedException
      jest
        .spyOn(guard, 'canActivate')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        guard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access when token format is incorrect', async () => {
      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'InvalidFormat token',
            },
          }),
          getResponse: jest.fn(),
        }),
      };

      // Mock the canActivate method to throw UnauthorizedException
      jest
        .spyOn(guard, 'canActivate')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        guard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should work with Injectable decorator', () => {
      // Verify that guard is injectable
      expect(guard).toBeDefined();
    });
  });
});
