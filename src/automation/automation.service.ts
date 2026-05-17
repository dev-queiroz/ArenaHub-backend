import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  constructor(private readonly prisma: PrismaService) {} 
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNightlyTasks() {
    this.logger.log('Iniciando tarefas automatizadas noturnas...');
    await this.archivePastReservations();
    await this.cancelPastPendingReservations();
    await this.syncCustomerStats();
    this.logger.log('Tarefas automatizadas noturnas concluídas.');
  }
  private async archivePastReservations() {
    this.logger.log('Arquivando reservas passadas para o histórico...');
    const now = new Date();
    const today = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z');
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    try {
      const pastReservations = await this.prisma.reservation.findMany({
        where: {
          OR: [
            { date: { lt: today } },
            { 
              date: today,
              endTime: { lte: currentTime }
            }
          ]
        },
        include: {
          court: { select: { name: true } }
        }
      });
      if (pastReservations.length === 0) {
        this.logger.log('Nenhuma reserva passada para arquivar.');
        return;
      }
      await this.prisma.$transaction(
        pastReservations.map(r => {
          return this.prisma.reservationHistory.create({
            data: {
              arenaId: r.arenaId,
              customerId: r.customerId,
              courtId: r.courtId,
              courtName: r.court.name,
              sport: r.sport,
              date: r.date,
              startTime: r.startTime,
              endTime: r.endTime,
              amount: r.amount,
              status: r.status,
              notes: r.notes,
            }
          });
        })
      );
      await this.prisma.reservation.deleteMany({
        where: {
          id: { in: pastReservations.map(r => r.id) }
        }
      });
      this.logger.log(`${pastReservations.length} reservas arquivadas com sucesso.`);
    } catch (error) {
      this.logger.error('Erro ao arquivar reservas passadas', error);
    }
  }
  private async cancelPastPendingReservations() {
    this.logger.log('Cancelando reservas pendentes passadas...');
    const now = new Date();
    const today = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z');
    try {
      const result = await this.prisma.reservation.updateMany({
        where: {
          status: 'Pending',
          date: {
            lt: today,
          },
        },
        data: {
          status: 'Cancelled',
          notes: 'Automatically cancelled by system (not confirmed and date expired).',
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
      const customers = await this.prisma.customer.findMany({
        select: { id: true }
      });
      let updatedCount = 0;
      for (const customer of customers) {
        const reservations = await this.prisma.reservation.findMany({
          where: {
            customerId: customer.id,
            status: { not: 'Cancelled' },
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





