import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

/**
 * CourtsService handles all business logic for court/facility management.
 * All queries are scoped by arenaId (multi-tenant isolation).
 */
@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists all courts belonging to the given arena.
   */
  async findAll(arenaId: string) {
    const courts = await this.prisma.court.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    // Get YYYY-MM-DD from local date and combine with UTC midnight to match DB format
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
        status: { in: ['Confirmado', 'Pendente'] }, // Include Pending as well for occupancy
        AND: [
          { startTime: { lte: currentTime } },
          { endTime: { gt: currentTime } },
        ],
      },
      select: { courtId: true },
    });

    const occupiedCourtIds = new Set(activeReservations.map((r) => r.courtId));

    return courts.map((court) => {
      // If it's already in maintenance, keep it. Otherwise, check if occupied.
      if (court.status === 'Manutencao') return court;
      
      return {
        ...court,
        status: occupiedCourtIds.has(court.id) ? 'Ocupada' : 'Disponivel',
      };
    });
  }

  /**
   * Finds a single court by ID, scoped to the arena.
   */
  async findOne(id: string, arenaId: string) {
    const court = await this.prisma.court.findFirst({
      where: { id, arenaId },
    });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }
    return court;
  }

  /**
   * Creates a new court for the given arena.
   */
  async create(arenaId: string, dto: CreateCourtDto) {
    return this.prisma.court.create({
      data: {
        ...dto,
        arenaId,
      },
    });
  }

  /**
   * Updates an existing court, ensuring tenant isolation.
   */
  async update(id: string, arenaId: string, dto: UpdateCourtDto) {
    await this.findOne(id, arenaId);
    return this.prisma.court.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Removes a court, ensuring tenant isolation.
   */
  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);
    return this.prisma.court.delete({ where: { id } });
  }
}
