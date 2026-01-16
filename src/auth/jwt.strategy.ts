import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Wyciągnij token z nagłówka 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  // Ta funkcja uruchomi się, jeśli token będzie poprawny
  validate(payload: { sub: number; email: string }) {
    // To, co tu zwrócisz, trafi do obiektu request.user
    return { userId: payload.sub, email: payload.email };
  }
}
