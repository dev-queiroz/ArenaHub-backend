import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const existing = await this.findOne(id, arenaId);
    
    let conflicts: any[] = [];
    
    // If setting to Maintenance, check for existing reservations
    if (dto.status === 'Manutencao') {
      const now = new Date();
      // Combine date and time if maintenanceEnd is provided
      const cutoff = dto.maintenanceEnd ? new Date(dto.maintenanceEnd) : now;

      conflicts = await this.prisma.reservation.findMany({
        where: {
          courtId: id,
          status: { in: ['Confirmado', 'Pendente'] },
          OR: [
            {
              date: { gt: now }, // Future days
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

      // If maintenanceEnd is provided, only keep conflicts BEFORE the maintenance end
      if (dto.maintenanceEnd) {
        // This is a bit complex to filter precisely in SQL with the current schema (date as Date, startTime as string)
        // Let's filter in memory for simplicity or just return all future ones and let the frontend decide.
        // The user said: "se o dono disser que ela sai de manutenção e fica disponível antes de x, aí os que são depois de x continuam"
        // So we only warn about those BEFORE x.
        
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

  /**
   * Removes a court, ensuring tenant isolation.
   */
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
