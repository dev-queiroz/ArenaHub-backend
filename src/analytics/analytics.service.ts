import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AnalyticsService generates executive reports for the arena.
 * Mirrors the frontend Analytics page calculations.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a full analytics report: revenue by sport, occupancy by court,
   * average ticket, active customers, etc.
   */
  async getReport(arenaId: string, period?: string) {
    const [reservations, courts, customers] = await Promise.all([
      this.prisma.reservation.findMany({ where: { arenaId } }),
      this.prisma.court.findMany({ where: { arenaId } }),
      this.prisma.customer.findMany({ where: { arenaId } }),
    ]);

    const billable = reservations.filter((r) => r.status !== 'Cancelado');
    const totalRevenue = billable.reduce((sum, r) => sum + Number(r.amount), 0);
    const averageTicket = billable.length > 0 ? totalRevenue / billable.length : 0;
    const activeCustomers = customers.filter((c) => c.status === 'Ativo').length;
    const occupancyAverage = 0; // Temporarily 0 as field was removed from model

    // Revenue by sport
    const revenueBySportMap: Record<string, number> = {};
    billable.forEach((r) => {
      revenueBySportMap[r.sport] = (revenueBySportMap[r.sport] ?? 0) + Number(r.amount);
    });
    const revenueBySport = Object.entries(revenueBySportMap).map(([name, total]) => ({
      name,
      total,
    }));

    // Occupancy by court
    const occupancy = courts.map((c) => ({
      name: c.name,
      ocupacao: 0,
    }));

    return {
      period: period ?? '30d',
      revenue: totalRevenue,
      averageTicket,
      activeCustomers,
      occupancyAverage,
      revenueBySport,
      occupancy,
    };
  }
}
