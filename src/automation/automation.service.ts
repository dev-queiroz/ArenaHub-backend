import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run every night at midnight.
   * Cancels all 'Pendente' reservations that are from previous days.
   * Also recalculates totalSpent and reservationsCount for all customers to ensure data consistency.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNightlyTasks() {
    this.logger.log('Iniciando tarefas automatizadas noturnas...');
    
    await this.cancelPastPendingReservations();
    await this.syncCustomerStats();
    
    this.logger.log('Tarefas automatizadas noturnas concluídas.');
  }

  private async cancelPastPendingReservations() {
    this.logger.log('Cancelando reservas pendentes passadas...');
    
    const now = new Date();
    // Midnight of today in UTC to match how dates are stored
    const today = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z');

    try {
      const result = await this.prisma.reservation.updateMany({
        where: {
          status: 'Pendente',
          date: {
            lt: today,
          },
        },
        data: {
          status: 'Cancelado',
          notes: 'Cancelada automaticamente pelo sistema (não confirmada e data expirada).',
        },
      });
      
      this.logger.log(`Foram canceladas ${result.count} reservas pendentes expiradas.`);
    } catch (error) {
      this.logger.error('Erro ao cancelar reservas pendentes passadas', error);
    }
  }

  private async syncCustomerStats() {
    this.logger.log('Sincronizando estatísticas de todos os clientes...');
    
    try {
      // Find all customers
      const customers = await this.prisma.customer.findMany({
        select: { id: true }
      });

      let updatedCount = 0;

      for (const customer of customers) {
        // Find their confirmed/completed reservations
        const reservations = await this.prisma.reservation.findMany({
          where: {
            customerId: customer.id,
            status: { not: 'Cancelado' },
          },
        });

        const reservationsCount = reservations.length;
        const totalSpent = reservations.reduce((acc, curr) => acc + Number(curr.amount), 0);

        await this.prisma.customer.update({
          where: { id: customer.id },
          data: {
            reservationsCount,
            totalSpent,
          },
        });
        
        updatedCount++;
      }
      
      this.logger.log(`Estatísticas atualizadas para ${updatedCount} clientes.`);
    } catch (error) {
      this.logger.error('Erro ao sincronizar estatísticas de clientes', error);
    }
  }
}
