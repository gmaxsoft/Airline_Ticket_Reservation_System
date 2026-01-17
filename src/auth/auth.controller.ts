import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autentykacja')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logowanie użytkownika' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Pomyślne logowanie - zwraca token JWT',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          fullName: 'Jan Kowalski',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Nieprawidłowe dane logowania',
  })
  async login(@Body() loginDto: LoginDto): Promise<{
    access_token: string;
    user: { id: number; email: string; fullName: string };
  }> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
