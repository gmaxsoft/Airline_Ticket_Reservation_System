import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    // Upewnij się, że DATABASE_URL jest dostępna w zmiennych środowiskowych
    // Prisma 7 automatycznie odczytuje DATABASE_URL z process.env
    const databaseUrl =
      configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    // Ustawiamy DATABASE_URL w process.env przed wywołaniem super()
    // Prisma Client automatycznie odczytuje DATABASE_URL z process.env
    process.env.DATABASE_URL = databaseUrl;
    super();
  }

  async onModuleInit() {
    // Nawiązanie połączenia z bazą danych przy starcie aplikacji
    await this.$connect();
  }

  async onModuleDestroy() {
    // Zamknięcie połączenia z bazą danych przy wyłączaniu aplikacji
    await this.$disconnect();
  }
}
