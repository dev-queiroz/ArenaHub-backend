import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(arenaId: string) {
    const courts = await this.prisma.court.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const activeReservations = await this.prisma.reservation.findMany({
      where: {
        arenaId,
        date: today,
        status: { in: ['Confirmed', 'Pending'] },
        AND: [{ startTime: { lte: currentTime } }, { endTime: { gt: currentTime } }],
      },
      select: { courtId: true },
    });

    const occupiedCourtIds = new Set(activeReservations.map((reservation) => reservation.courtId));

    return courts.map((court) => {
      const hasActiveMaintenance =
        court.status === 'Maintenance' &&
        (!court.maintenanceStart || court.maintenanceStart <= now) &&
        (!court.maintenanceEnd || court.maintenanceEnd >= now);

      if (hasActiveMaintenance) {
        return court;
      }

      return {
        ...court,
        status: occupiedCourtIds.has(court.id) ? 'Occupied' : 'Available',
      };
    });
  }

  async findOne(id: string, arenaId: string) {
    const court = await this.prisma.court.findFirst({
      where: { id, arenaId },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
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
    await this.findOne(id, arenaId);

    let conflicts: any[] = [];
    const maintenanceStart = dto.maintenanceStart ?? null;
    const maintenanceEnd = dto.maintenanceEnd ?? null;

    if (dto.status === 'Maintenance') {
      if (!maintenanceStart || !maintenanceEnd) {
        throw new BadRequestException('Maintenance start and end dates are required');
      }

      if (maintenanceEnd < maintenanceStart) {
        throw new BadRequestException('Maintenance end date must be after start date');
      }

      conflicts = await this.prisma.reservation.findMany({
        where: {
          courtId: id,
          status: { in: ['Confirmed', 'Pending'] },
          date: {
            gte: new Date(maintenanceStart.toISOString().slice(0, 10) + 'T00:00:00.000Z'),
            lte: new Date(maintenanceEnd.toISOString().slice(0, 10) + 'T23:59:59.999Z'),
          },
        },
        include: {
          customer: { select: { name: true, phone: true, email: true } },
        },
      });
    }

    const court = await this.prisma.court.update({
      where: { id },
      data: {
        ...dto,
        maintenanceStart: dto.status === 'Maintenance' ? maintenanceStart : dto.maintenanceStart ?? null,
        maintenanceEnd: dto.status === 'Maintenance' ? maintenanceEnd : dto.maintenanceEnd ?? null,
      },
    });

    return { court, conflicts };
  }

  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);

    const hasReservations = await this.prisma.reservation.findFirst({
      where: { courtId: id },
    });

    if (hasReservations) {
      throw new BadRequestException('Cannot delete a court that has reservations. Cancel or move the reservations first.');
    }

    return this.prisma.court.delete({ where: { id } });
  }
}
