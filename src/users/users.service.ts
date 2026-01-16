import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Sprawdź czy użytkownik o danym email już istnieje
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hashowanie hasła przed zapisem
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        fullName: createUserDto.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        // Hasło nie jest zwracane ze względów bezpieczeństwa
      },
    });

    return user;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        // Hasło nie jest zwracane ze względów bezpieczeństwa
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        // Hasło nie jest zwracane ze względów bezpieczeństwa
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    // Sprawdź czy użytkownik istnieje
    await this.findOne(id);

    // Jeśli email jest aktualizowany, sprawdź czy nie istnieje już inny użytkownik z tym emailem
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updateData: {
      email?: string;
      password?: string;
      fullName?: string;
    } = {};

    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.fullName) updateData.fullName = updateUserDto.fullName;

    // Hashowanie hasła jeśli jest aktualizowane
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        // Hasło nie jest zwracane ze względów bezpieczeństwa
      },
    });

    return user;
  }

  async remove(id: number): Promise<Omit<User, 'password'>> {
    // Sprawdź czy użytkownik istnieje
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        // Hasło nie jest zwracane ze względów bezpieczeństwa
      },
    });
  }
}
