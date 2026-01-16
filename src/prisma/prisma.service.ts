import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config'; // Załaduj zmienne środowiskowe przed użyciem

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    // Upewnij się, że DATABASE_URL jest dostępna w zmiennych środowiskowych
    // Prisma 7 automatycznie odczytuje DATABASE_URL z process.env
    const databaseUrl =
      configService.get<string>('DATABASE_URL') || 
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/airline_reservation?schema=public';
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    // Ustawiamy DATABASE_URL w process.env PRZED wywołaniem super()
    // Prisma 7 automatycznie odczytuje DATABASE_URL z process.env podczas tworzenia PrismaClient
    process.env.DATABASE_URL = databaseUrl;
    
    // Prisma 7 automatycznie użyje DATABASE_URL z process.env
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
