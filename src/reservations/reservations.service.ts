import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  private isReservationInsideMaintenanceWindow(
    reservationDate: string,
    reservationTime: string,
    maintenanceStart?: Date | null,
    maintenanceEnd?: Date | null,
  ) {
    if (!maintenanceStart && !maintenanceEnd) {
      return false;
    }

    const [year, month, day] = reservationDate.split('-').map(Number);
    const [hours, minutes] = reservationTime.split(':').map(Number);
    const reservationStart = new Date(year, month - 1, day, hours, minutes);
    const maintenanceStartDate = maintenanceStart ?? new Date(0);
    const maintenanceEndDate = maintenanceEnd ?? new Date('9999-12-31T23:59:59.999Z');

    return reservationStart >= maintenanceStartDate && reservationStart <= maintenanceEndDate;
  }
  async findAll(arenaId: string) {
    return this.prisma.reservation.findMany({
      where: { arenaId },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        court: { select: { name: true } },
        consumption: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
  async findOne(id: string, arenaId: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id, arenaId },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        court: { select: { name: true } },
        consumption: true,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation;
  }
  async create(arenaId: string, dto: CreateReservationDto) {
    const [year, month, day] = dto.date.split('-').map(Number);
    const [hours, minutes] = dto.startTime.split(':').map(Number);
    const reservationStart = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    if (reservationStart < now) {
      throw new BadRequestException('Reservations cannot be made for a past time');
    }
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('End time must be after start time');
    }
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: { status: true }
    });
    if (customer?.status === 'Inactive') {
      throw new BadRequestException('Cannot make reservations for inactive customers');
    }
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      select: { status: true, maintenanceStart: true, maintenanceEnd: true }
    });
    if (
      court &&
      this.isReservationInsideMaintenanceWindow(
        dto.date,
        dto.startTime,
        court.maintenanceStart,
        court.maintenanceEnd,
      )
    ) {
      throw new BadRequestException(
        `This court is under maintenance from ${court.maintenanceStart?.toLocaleDateString() ?? 'now'} until ${court.maintenanceEnd?.toLocaleDateString() ?? 'further notice'}`,
      );
    }
    await this.validateOperatingHours(arenaId, dto.date, dto.startTime, dto.endTime);
    const collision = await this.prisma.reservation.findFirst({
      where: {
        courtId: dto.courtId,
        date: new Date(dto.date + 'T00:00:00Z'),
        status: { not: 'Cancelled' },
        AND: [
          { startTime: { lt: dto.endTime } },
          { endTime: { gt: dto.startTime } },
        ],
      },
    });
    if (collision) {
      throw new BadRequestException('There is already a reservation for this court at this time');
    }
    const reservation = await this.prisma.reservation.create({
      data: {
        ...dto,
        date: new Date(dto.date + 'T00:00:00Z'), 
        arenaId,
      },
      include: {
        customer: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
    });
    await this.syncCustomerStats(dto.customerId);
    return reservation;
  }
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
        throw new BadRequestException('Reservation cannot be changed to a past time');
      }
      if (dto.date) {
        data.date = new Date(dto.date + 'T00:00:00Z');
      }
    }
    const startTime = dto.startTime || existing.startTime;
    const endTime = dto.endTime || existing.endTime;
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }
    const dateToCheck = dto.date || existing.date.toISOString().slice(0, 10);
    await this.validateOperatingHours(arenaId, dateToCheck, startTime, endTime);
    const dateObjToCheck = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
    const courtIdToCheck = dto.courtId || existing.courtId;
    const collision = await this.prisma.reservation.findFirst({
      where: {
        id: { not: id },
        courtId: courtIdToCheck,
        date: dateObjToCheck,
        status: { not: 'Cancelled' },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });
    if (collision) {
      throw new BadRequestException('Cannot change to this time due to a conflicting reservation');
    }
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId || existing.customerId },
      select: { status: true }
    });
    if (customer?.status === 'Inactive') {
      throw new BadRequestException('Cannot make reservations for inactive customers');
    }
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId || existing.courtId },
      select: { status: true, maintenanceStart: true, maintenanceEnd: true }
    });
    if (
      court &&
      this.isReservationInsideMaintenanceWindow(
        dto.date || existing.date.toISOString().slice(0, 10),
        dto.startTime || existing.startTime,
        court.maintenanceStart,
        court.maintenanceEnd,
      )
    ) {
      throw new BadRequestException(
        `This court is under maintenance from ${court.maintenanceStart?.toLocaleDateString() ?? 'now'} until ${court.maintenanceEnd?.toLocaleDateString() ?? 'further notice'}`,
      );
    }
    const updated = await this.prisma.reservation.update({
      where: { id },
      data,
      include: {
        customer: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
    });
    await this.syncCustomerStats(updated.customerId);
    return updated;
  }
  async remove(id: string, arenaId: string) {
    const existing = await this.findOne(id, arenaId);
    const deleted = await this.prisma.reservation.delete({ where: { id } });
    await this.syncCustomerStats(existing.customerId);
    return deleted;
  }
  private async syncCustomerStats(customerId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        customerId,
        status: { not: 'Cancelled' },
      },
      include: { consumption: true }
    });
    const reservationsCount = reservations.length;
    const totalSpent = reservations.reduce((acc, curr: any) => {
      const consumptionTotal = curr.consumption?.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0) || 0;
      return acc + Number(curr.amount) + consumptionTotal;
    }, 0);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { reservationsCount, totalSpent },
    });
  }
  private async validateOperatingHours(arenaId: string, dateStr: string, startTime: string, endTime: string) {
    const arena = await this.prisma.arena.findUnique({
      where: { id: arenaId },
      include: { settings: { include: { operatingHours: true } } },
    });
    if (!arena?.settings?.operatingHours?.length) return;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); 
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysMap[dayOfWeek];
    const operatingHour = arena.settings.operatingHours.find((h) =>
      h.day.toLowerCase().substring(0, 3) === dayName.toLowerCase().substring(0, 3)
    );
    if (!operatingHour) return;
    if (!operatingHour.enabled) {
      throw new BadRequestException(`The arena is closed: ${dayName}`);
    }
    if (startTime < operatingHour.open || endTime > operatingHour.close) {
      throw new BadRequestException(`Operating hours out of range on ${dayName}. Operating hours: ${operatingHour.open} to ${operatingHour.close}`);
    }
  }
}





