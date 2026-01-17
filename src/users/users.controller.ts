import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

// Typ użytkownika bez hasła (bezpieczny)
type SafeUser = Omit<User, 'password'>;

@ApiTags('Użytkownicy')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Utworzenie nowego użytkownika' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Użytkownik został pomyślnie utworzony',
  })
  @ApiResponse({
    status: 400,
    description: 'Nieprawidłowe dane',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobranie listy wszystkich użytkowników' })
  @ApiResponse({
    status: 200,
    description: 'Lista użytkowników',
  })
  async findAll(): Promise<SafeUser[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobranie użytkownika po ID' })
  @ApiParam({ name: 'id', description: 'ID użytkownika', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Szczegóły użytkownika',
  })
  @ApiResponse({
    status: 404,
    description: 'Użytkownik nie został znaleziony',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SafeUser> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aktualizacja użytkownika' })
  @ApiParam({ name: 'id', description: 'ID użytkownika', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Użytkownik został zaktualizowany',
  })
  @ApiResponse({
    status: 404,
    description: 'Użytkownik nie został znaleziony',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SafeUser> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usunięcie użytkownika' })
  @ApiParam({ name: 'id', description: 'ID użytkownika', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Użytkownik został usunięty',
  })
  @ApiResponse({
    status: 404,
    description: 'Użytkownik nie został znaleziony',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SafeUser> {
    return this.usersService.remove(id);
  }
}
