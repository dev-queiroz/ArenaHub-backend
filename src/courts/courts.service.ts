import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) 
  async findAll(arenaId: string) {
    const courts = await this.prisma.court.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const today = new Date(`${todayStr}T00:00:00Z`);
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const activeReservations = await this.prisma.reservation.findMany({
      where: {
        arenaId,
        date: today,
        status: { in: ['Confirmado', 'Pendente'] }, 
        AND: [
          { startTime: { lte: currentTime } },
          { endTime: { gt: currentTime } },
        ],
      },
      select: { courtId: true },
    });
    const occupiedCourtIds = new Set(activeReservations.map((r) => r.courtId));
    return courts.map((court) => {
      if (court.status === 'Manutencao') return court;
      return {
        ...court,
        status: occupiedCourtIds.has(court.id) ? 'Ocupada' : 'Disponivel',
      };
    });
  }
  async findOne(id: string, arenaId: string) {
    const court = await this.prisma.court.findFirst({
      where: { id, arenaId },
    });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }
    return court;
  }
  async create(arenaId: string, dto: CreateCourtDto) {
    return this.prisma.court.create({
      data: {
        ...dto,
        arenaId,
      },
    });
  }
  async update(id: string, arenaId: string, dto: UpdateCourtDto) {
    const existing = await this.findOne(id, arenaId);
    let conflicts: any[] = [];
    if (dto.status === 'Manutencao') {
      const now = new Date();
      const cutoff = dto.maintenanceEnd ? new Date(dto.maintenanceEnd) : now;
      conflicts = await this.prisma.reservation.findMany({
        where: {
          courtId: id,
          status: { in: ['Confirmado', 'Pendente'] },
          OR: [
            {
              date: { gt: now }, 
            },
            {
              date: { 
                gte: new Date(now.toISOString().split('T')[0] + 'T00:00:00Z') 
              },
              startTime: { gte: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') }
            }
          ]
        },
        include: {
          customer: { select: { name: true, phone: true } }
        }
      });
      if (dto.maintenanceEnd) {
        conflicts = conflicts.filter(r => {
          const [h, m] = r.startTime.split(':').map(Number);
          const rDate = new Date(r.date);
          rDate.setHours(h, m);
          return rDate < cutoff;
        });
      }
    }
    const court = await this.prisma.court.update({
      where: { id },
      data: dto,
    });
    return { court, conflicts };
  }
  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);
    const hasReservations = await this.prisma.reservation.findFirst({
      where: { courtId: id },
    });
    if (hasReservations) {
      throw new BadRequestException(
        'Não é possível excluir uma quadra que possui reservas. Cancele ou mova as reservas primeiro.',
      );
    }
    return this.prisma.court.delete({ where: { id } });
  }
}
