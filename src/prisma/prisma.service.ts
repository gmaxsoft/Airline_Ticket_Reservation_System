import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    // Prisma 7 wymaga przekazania opcji w konstruktorze
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
