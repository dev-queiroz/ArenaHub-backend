import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

/**
 * TeamService handles CRUD for team members (staff) of an arena.
 * All queries are scoped by arenaId.
 */
@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(arenaId: string) {
    return this.prisma.teamMember.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, arenaId: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id, arenaId },
    });
    if (!member) {
      throw new NotFoundException('Membro da equipe não encontrado');
    }
    return member;
  }

  async create(arenaId: string, dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({
      data: { ...dto, arenaId },
    });
  }

  async update(id: string, arenaId: string, dto: UpdateTeamMemberDto) {
    await this.findOne(id, arenaId);
    return this.prisma.teamMember.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);
    return this.prisma.teamMember.delete({ where: { id } });
  }
}
