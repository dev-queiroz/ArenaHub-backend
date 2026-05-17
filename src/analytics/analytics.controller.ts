import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter relatório analítico da arena' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  getReport(
    @TenantId() arenaId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if ((from && !to) || (!from && to)) {
      throw new BadRequestException('Both from and to dates must be provided together');
    }

    return this.analyticsService.getReport(arenaId, from, to);
  }
}
