import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

/**
 * ReservationsController — CRUD endpoints for reservation/booking management.
 * All routes require JWT auth and tenant context.
 */
@ApiTags('Reservations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as reservas da arena' })
  findAll(@TenantId() arenaId: string) {
    return this.reservationsService.findAll(arenaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma reserva' })
  findOne(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.reservationsService.findOne(id, arenaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova reserva' })
  create(@TenantId() arenaId: string, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(arenaId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar reserva existente' })
  update(
    @Param('id') id: string,
    @TenantId() arenaId: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, arenaId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir reserva' })
  remove(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.reservationsService.remove(id, arenaId);
  }
}
