import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Nawiązanie połączenia z bazą danych przy starcie aplikacji
    await this.$connect();
  }

  async onModuleDestroy() {
    // Zamknięcie połączenia z bazą danych przy wyłączaniu aplikacji
    await this.$disconnect();
  }
}
