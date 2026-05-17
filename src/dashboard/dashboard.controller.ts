import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { DashboardService } from './dashboard.service';
@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {} @Get()
  @ApiOperation({ summary: 'Obter métricas consolidadas do dashboard' })
  getMetrics(@TenantId() arenaId: string) {
    return this.dashboardService.getMetrics(arenaId);
  }
}





