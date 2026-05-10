import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DashboardService aggregates key metrics for the arena dashboard.
 * Mirrors the frontend Dashboard page calculations but server-side.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns consolidated metrics for the arena:
   * revenue, reservation count, active customers, avg occupancy, and upcoming reservations.
   */
  async getMetrics(arenaId: string) {
    const [reservations, courts, customers] = await Promise.all([
      this.prisma.reservation.findMany({
        where: { arenaId },
        include: {
          customer: { select: { name: true, email: true } },
          court: { select: { name: true } },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      }),
      this.prisma.court.findMany({ where: { arenaId } }),
      this.prisma.customer.findMany({ where: { arenaId } }),
    ]);

    const billable = reservations.filter((r) => r.status !== 'Cancelado');
    const revenue = billable.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const activeCustomers = customers.filter((c) => c.status === 'Ativo').length;
    
    // Calculate occupancy for today
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const today = new Date(`${todayStr}T00:00:00Z`);

    const todayReservations = billable.filter(r => 
      new Date(r.date).toISOString().split('T')[0] === todayStr
    );

    // Simplistic occupancy: (reserved hours / (courts * 14 hours available)) * 100
    let reservedMinutes = 0;
    todayReservations.forEach(r => {
      const [startH, startM] = r.startTime.split(':').map(Number);
      const [endH, endM] = r.endTime.split(':').map(Number);
      reservedMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    });

    const totalAvailableMinutes = courts.length * 14 * 60; // 14 hours per court
    const occupancy = totalAvailableMinutes > 0 
      ? Math.min(100, Math.round((reservedMinutes / totalAvailableMinutes) * 100))
      : 0;

    // Sport mix
    const sportMix: Record<string, number> = {};
    reservations.forEach((r) => {
      sportMix[r.sport] = (sportMix[r.sport] ?? 0) + 1;
    });

    return {
      revenue,
      totalReservations: reservations.length,
      activeCustomers,
      occupancyAverage: occupancy,
      upcoming: reservations.slice(0, 6).map((r) => ({
        id: r.id,
        customerName: r.customer.name,
        customerEmail: r.customer.email,
        courtName: r.court.name,
        date: r.date,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
      })),
      sportMix: Object.entries(sportMix).map(([sport, count]) => ({
        sport,
        count,
        percent:
          reservations.length > 0
            ? Math.round((count / reservations.length) * 100)
            : 0,
      })),
    };
  }
}
