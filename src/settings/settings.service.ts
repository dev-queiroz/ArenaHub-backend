import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateArenaProfileDto } from './dto/update-arena-profile.dto';

/**
 * SettingsService manages arena configuration: profile, operating hours,
 * notification preferences, and payment methods.
 * All queries are scoped by arenaId.
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the full settings for the arena, including operating hours.
   */
  async getSettings(arenaId: string) {
    const arena = await this.prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        settings: {
          include: { operatingHours: true },
        },
      },
    });

    if (!arena) {
      throw new NotFoundException('Arena não encontrada');
    }

    const team = await this.prisma.teamMember.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });

    return {
      profile: {
        arenaName: arena.name,
        taxId: arena.taxId,
        email: arena.email,
        phone: arena.phone,
        address: arena.address,
      },
      hours: arena.settings?.operatingHours ?? [],
      notifications: arena.settings
        ? {
            reservationReminder: arena.settings.reservationReminder,
            paymentConfirmation: arena.settings.paymentConfirmation,
            cancellationAlert: arena.settings.cancellationAlert,
            marketingCampaigns: arena.settings.marketingCampaigns,
          }
        : null,
      payments: arena.settings
        ? {
            pix: arena.settings.pix,
            creditCard: arena.settings.creditCard,
            debitCard: arena.settings.debitCard,
            cash: arena.settings.cash,
            bankTransfer: arena.settings.bankTransfer,
          }
        : null,
      team,
    };
  }

  /**
   * Updates the arena profile (name, taxId, email, phone, address).
   */
  async updateProfile(arenaId: string, dto: UpdateArenaProfileDto) {
    return this.prisma.arena.update({
      where: { id: arenaId },
      data: {
        name: dto.arenaName,
        taxId: dto.taxId,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }

  /**
   * Updates notification and payment preferences.
   */
  async updateSettings(arenaId: string, dto: UpdateSettingsDto) {
    return this.prisma.arenaSettings.upsert({
      where: { arenaId },
      update: {
        reservationReminder: dto.reservationReminder,
        paymentConfirmation: dto.paymentConfirmation,
        cancellationAlert: dto.cancellationAlert,
        marketingCampaigns: dto.marketingCampaigns,
        pix: dto.pix,
        creditCard: dto.creditCard,
        debitCard: dto.debitCard,
        cash: dto.cash,
        bankTransfer: dto.bankTransfer,
      },
      create: {
        arenaId,
        reservationReminder: dto.reservationReminder,
        paymentConfirmation: dto.paymentConfirmation,
        cancellationAlert: dto.cancellationAlert,
        marketingCampaigns: dto.marketingCampaigns,
        pix: dto.pix,
        creditCard: dto.creditCard,
        debitCard: dto.debitCard,
        cash: dto.cash,
        bankTransfer: dto.bankTransfer,
      },
    });
  }

  /**
   * Replaces all operating hours for the arena.
   */
  async updateOperatingHours(
    arenaId: string,
    hours: { day: string; enabled: boolean; open: string; close: string }[],
  ) {
    // Ensure ArenaSettings exists
    const settings = await this.prisma.arenaSettings.upsert({
      where: { arenaId },
      update: {},
      create: { arenaId },
    });

    // Delete existing hours and recreate
    await this.prisma.operatingHour.deleteMany({
      where: { settingsId: settings.id },
    });

    return this.prisma.operatingHour.createMany({
      data: hours.map((h) => ({
        settingsId: settings.id,
        day: h.day,
        enabled: h.enabled,
        open: h.open,
        close: h.close,
      })),
    });
  }
}
