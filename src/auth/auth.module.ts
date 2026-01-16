import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule, // Wymagane dla PassportStrategy
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret-key',
        signOptions: { expiresIn: '1d' }, // Token ważny przez 1 dzień
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard], // Dodaj JwtAuthGuard do providers
  controllers: [AuthController],
  exports: [JwtAuthGuard], // Eksportuj Guard aby inne moduły mogły go używać
})
export class AuthModule {}
