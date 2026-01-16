import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

// Mock PrismaClient to avoid database connection issues in tests
jest.mock('.prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      $on: jest.fn(),
    })),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Set DATABASE_URL before creating the module
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/airline_reservation?schema=public';

    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'DATABASE_URL') {
          return (
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5432/airline_reservation?schema=public'
          );
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    // Clean up Prisma Client connection after each test
    try {
      if (service && typeof service.$disconnect === 'function') {
        await service.$disconnect();
      }
    } catch {
      // Ignore disconnect errors in tests
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect('onModuleInit' in service).toBe(true);
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect('onModuleDestroy' in service).toBe(true);
    expect(typeof service.onModuleDestroy).toBe('function');
  });
});
