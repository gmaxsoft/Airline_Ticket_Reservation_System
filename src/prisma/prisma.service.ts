import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    // Upewnij się, że DATABASE_URL jest dostępna w zmiennych środowiskowych
    const databaseUrl =
      configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/airline_reservation?schema=public';

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Tworzymy adapter dla Prisma 7
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    // Przekazujemy adapter do PrismaClient
    super({
      adapter,
    });
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
