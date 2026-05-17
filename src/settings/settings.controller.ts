import {
  Controller, Get, Put, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateArenaProfileDto } from './dto/update-arena-profile.dto';
@ApiTags('Settings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {} @Get()
  @ApiOperation({ summary: 'Obter configurações da arena' })
  getSettings(@TenantId() arenaId: string) {
    return this.settingsService.getSettings(arenaId);
  }
  @Put('profile')
  @ApiOperation({ summary: 'Atualizar perfil da arena' })
  updateProfile(
    @TenantId() arenaId: string,
    @Body() dto: UpdateArenaProfileDto,
  ) {
    return this.settingsService.updateProfile(arenaId, dto);
  }
  @Put('preferences')
  @ApiOperation({ summary: 'Atualizar notificações e pagamentos' })
  updateSettings(
    @TenantId() arenaId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(arenaId, dto);
  }
  @Put('hours')
  @ApiOperation({ summary: 'Atualizar horários de funcionamento' })
  updateHours(
    @TenantId() arenaId: string,
    @Body() body: { hours: { day: string; enabled: boolean; open: string; close: string }[] },
  ) {
    return this.settingsService.updateOperatingHours(arenaId, body.hours);
  }
}





