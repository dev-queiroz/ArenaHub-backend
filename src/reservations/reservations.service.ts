import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

/**
 * ReservationsService handles all business logic for reservation/booking management.
 * All queries are scoped by arenaId (multi-tenant isolation).
 */
@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists all reservations for the given arena, including customer and court names.
   */
  async findAll(arenaId: string) {
    return this.prisma.reservation.findMany({
      where: { arenaId },
      include: {
        customer: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Finds a single reservation by ID, scoped to the arena.
   */
  async findOne(id: string, arenaId: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id, arenaId },
      include: {
        customer: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }
    return reservation;
  }

  async create(arenaId: string, dto: CreateReservationDto) {
    // 1. Combine date and time to check if it's in the past
    // We expect dto.date in YYYY-MM-DD and dto.startTime in HH:mm
    // To handle Brazil (UTC-3), we should ideally work with consistent offsets
    // For now, let's create a date object representing the start of the reservation in the arena's local time
    const [year, month, day] = dto.date.split('-').map(Number);
    const [hours, minutes] = dto.startTime.split(':').map(Number);
    
    // Create date in "local" server time (assuming server is set to the same as arena or we handle it)
    // Actually, it's safer to compare UTC to UTC if we know the offset.
    // Given the user is in Brazil (UTC-3):
    const reservationStart = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    if (reservationStart < now) {
      throw new BadRequestException('A reserva não pode ser realizada em um horário que já passou');
    }

    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('O horário de término deve ser após o horário de início');
    }

    // 2. Collision detection (Double booking prevention)
    // Check if there is any reservation for the same court on the same day that overlaps
    const collision = await this.prisma.reservation.findFirst({
      where: {
        courtId: dto.courtId,
        date: new Date(dto.date + 'T00:00:00Z'),
        status: { not: 'Cancelado' },
        AND: [
          { startTime: { lt: dto.endTime } },
          { endTime: { gt: dto.startTime } },
        ],
      },
    });

    if (collision) {
      throw new BadRequestException('Já existe uma reserva para esta quadra neste horário');
    }

    return this.prisma.reservation.create({
      data: {
        ...dto,
        date: new Date(dto.date + 'T00:00:00Z'), // Save as UTC midnight for consistent storage
        arenaId,
      },
      include: {
        customer: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
    });
  }

  /**
   * Updates an existing reservation, ensuring tenant isolation.
   */
  async update(id: string, arenaId: string, dto: UpdateReservationDto) {
    const existing = await this.findOne(id, arenaId);
    const data: any = { ...dto };
    
    if (dto.date || dto.startTime) {
      const dateStr = dto.date || existing.date.toISOString().slice(0, 10);
      const timeStr = dto.startTime || existing.startTime;
      
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const reservationStart = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();

      if (reservationStart < now) {
        throw new BadRequestException('A reserva não pode ser alterada para um horário que já passou');
      }
      
      if (dto.date) {
        data.date = new Date(dto.date + 'T00:00:00Z');
      }
    }

    const startTime = dto.startTime || existing.startTime;
    const endTime = dto.endTime || existing.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException('O horário de término deve ser após o horário de início');
    }

    // Collision detection for update
    const dateToCheck = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
    const courtIdToCheck = dto.courtId || existing.courtId;

    const collision = await this.prisma.reservation.findFirst({
      where: {
        id: { not: id },
        courtId: courtIdToCheck,
        date: dateToCheck,
        status: { not: 'Cancelado' },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (collision) {
      throw new BadRequestException('Não é possível alterar para este horário pois já existe outra reserva conflitante');
    }

    return this.prisma.reservation.update({
      where: { id },
      data,
      include: {
        customer: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
    });
  }

  /**
   * Removes a reservation, ensuring tenant isolation.
   */
  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);
    return this.prisma.reservation.delete({ where: { id } });
  }
}
