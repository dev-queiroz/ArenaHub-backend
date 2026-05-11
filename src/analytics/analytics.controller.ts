import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { AnalyticsService } from './analytics.service';
@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {} @Get()
  @ApiOperation({ summary: 'Obter relatório analítico da arena' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'] })
  getReport(
    @TenantId() arenaId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getReport(arenaId, period);
  }
}




