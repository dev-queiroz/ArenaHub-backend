import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(arenaId: string, from?: string, to?: string) {
    const endDate = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
    const startDate = from ? new Date(`${from}T00:00:00.000Z`) : new Date(endDate);

    if (!from) {
      startDate.setUTCDate(endDate.getUTCDate() - 30);
      startDate.setUTCHours(0, 0, 0, 0);
    }

    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    const [reservations, courts, customers] = await Promise.all([
      this.prisma.reservation.findMany({
        where: {
          arenaId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.court.findMany({ where: { arenaId } }),
      this.prisma.customer.findMany({ where: { arenaId } }),
    ]);

    const billable = reservations.filter((reservation) => reservation.status !== 'Cancelled');
    const totalRevenue = billable.reduce((sum, reservation) => sum + Number(reservation.amount), 0);
    const averageTicket = billable.length > 0 ? totalRevenue / billable.length : 0;
    const activeCustomers = customers.filter((customer) => customer.status === 'Active').length;

    const revenueBySportMap: Record<string, number> = {};
    billable.forEach((reservation) => {
      revenueBySportMap[reservation.sport] = (revenueBySportMap[reservation.sport] ?? 0) + Number(reservation.amount);
    });

    const revenueBySport = Object.entries(revenueBySportMap).map(([sport, total]) => ({
      sport,
      total,
    }));

    const totalHoursAvailable = totalDays * 14;
    const occupancy = courts.map((court) => {
      const courtReservations = billable.filter((reservation) => reservation.courtId === court.id);
      let reservedHours = 0;

      courtReservations.forEach((reservation) => {
        const [startH, startM] = reservation.startTime.split(':').map(Number);
        const [endH, endM] = reservation.endTime.split(':').map(Number);
        reservedHours += endH + endM / 60 - (startH + startM / 60);
      });

      const rate =
        totalHoursAvailable > 0
          ? Math.min(100, Math.round((reservedHours / totalHoursAvailable) * 100))
          : 0;

      return {
        name: court.name,
        occupancy: rate,
      };
    });

    const occupancyAverage =
      occupancy.length > 0
        ? Math.round(occupancy.reduce((sum, court) => sum + court.occupancy, 0) / occupancy.length)
        : 0;

    return {
      from: startDate.toISOString().slice(0, 10),
      to: endDate.toISOString().slice(0, 10),
      revenue: totalRevenue,
      averageTicket,
      activeCustomers,
      occupancyAverage,
      revenueBySport,
      occupancy,
    };
  }
}
