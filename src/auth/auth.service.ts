import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {} 
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email já cadastrado');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.$transaction(async (tx) => {
      const arena = await tx.arena.create({
        data: {
          name: dto.arenaName,
          taxId: dto.taxId,
          email: dto.email, 
          phone: '', 
          address: '', 
          settings: {
            create: {
              operatingHours: {
                create: [
                  { day: 'Segunda', open: '08:00', close: '22:00', enabled: true },
                  { day: 'Terça', open: '08:00', close: '22:00', enabled: true },
                  { day: 'Quarta', open: '08:00', close: '22:00', enabled: true },
                  { day: 'Quinta', open: '08:00', close: '22:00', enabled: true },
                  { day: 'Sexta', open: '08:00', close: '22:00', enabled: true },
                  { day: 'Sábado', open: '08:00', close: '18:00', enabled: true },
                  { day: 'Domingo', open: '08:00', close: '13:00', enabled: true },
                ],
              },
            },
          },
        },
      });
      return tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: UserRole.Administrador,
          arenaId: arena.id,
          status: 'Ativo',
        },
      });
    });
    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      arenaId: newUser.arenaId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        arenaId: newUser.arenaId,
      },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      arenaId: user.arenaId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        arenaId: user.arenaId,
      },
    };
  }
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        arenaId: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; phone?: string },
  ) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        arenaId: true,
      },
    });
  }
}




