import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) 
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
      throw new NotFoundException('Reserva não encontrada');
    }
    return reservation;
  }
  async create(arenaId: string, dto: CreateReservationDto) {
    const [year, month, day] = dto.date.split('-').map(Number);
    const [hours, minutes] = dto.startTime.split(':').map(Number);
    const reservationStart = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    if (reservationStart < now) {
      throw new BadRequestException('A reserva não pode ser realizada em um horário que já passou');
    }
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('O horário de término deve ser após o horário de início');
    }
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: { status: true }
    });
    if (customer?.status === 'Inativo') {
      throw new BadRequestException('Não é possível realizar reservas para clientes inativos');
    }
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      select: { status: true, maintenanceEnd: true }
    });
    if (court?.status === 'Manutencao') {
      if (court.maintenanceEnd) {
        if (reservationStart < court.maintenanceEnd) {
          throw new BadRequestException('Esta quadra está em manutenção até ' + court.maintenanceEnd.toLocaleString());
        }
      } else {
        throw new BadRequestException('Esta quadra está em manutenção por tempo indeterminado');
      }
    }
    await this.validateOperatingHours(arenaId, dto.date, dto.startTime, dto.endTime);
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
    const dateToCheck = dto.date || existing.date.toISOString().slice(0, 10);
    await this.validateOperatingHours(arenaId, dateToCheck, startTime, endTime);
    const dateObjToCheck = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
    const courtIdToCheck = dto.courtId || existing.courtId;
    const collision = await this.prisma.reservation.findFirst({
      where: {
        id: { not: id },
        courtId: courtIdToCheck,
        date: dateObjToCheck,
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
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId || existing.customerId },
      select: { status: true }
    });
    if (customer?.status === 'Inativo') {
      throw new BadRequestException('Não é possível realizar reservas para clientes inativos');
    }
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId || existing.courtId },
      select: { status: true, maintenanceEnd: true }
    });
    if (court?.status === 'Manutencao') {
      const dateToCheck = dto.date || existing.date.toISOString().slice(0, 10);
      const timeToCheck = dto.startTime || existing.startTime;
      const [y, m, d] = dateToCheck.split('-').map(Number);
      const [h, min] = timeToCheck.split(':').map(Number);
      const startToCheck = new Date(y, m - 1, d, h, min);
      if (court.maintenanceEnd) {
        if (startToCheck < court.maintenanceEnd) {
          throw new BadRequestException('Esta quadra está em manutenção até ' + court.maintenanceEnd.toLocaleString());
        }
      } else {
        throw new BadRequestException('Esta quadra está em manutenção por tempo indeterminado');
      }
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
        status: { not: 'Cancelado' },
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
    const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = daysMap[dayOfWeek];
    const operatingHour = arena.settings.operatingHours.find(h => 
      h.day.toLowerCase().startsWith(dayName.toLowerCase().substring(0, 3))
    );
    if (!operatingHour) return;
    if (!operatingHour.enabled) {
      throw new BadRequestException(`A arena está fechada: ${dayName}`);
    }
    if (startTime < operatingHour.open || endTime > operatingHour.close) {
      throw new BadRequestException(`Horário fora de operação na ${dayName}. Funcionamento: ${operatingHour.open} às ${operatingHour.close}`);
    }
  }
}
