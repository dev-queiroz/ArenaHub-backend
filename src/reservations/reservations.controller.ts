import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
@ApiTags('Reservations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {} @Get()
  @ApiOperation({ summary: 'Listar todas as reservas da arena' })
  @ApiResponse({ status: 200, description: 'Lista de reservas retornada com sucesso.' })
  findAll(@TenantId() arenaId: string) {
    return this.reservationsService.findAll(arenaId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma reserva' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  findOne(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.reservationsService.findOne(id, arenaId);
  }
  @Post()
  @ApiOperation({ summary: 'Criar nova reserva' })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Conflito de horários ou arena Closed no horário solicitado.' })
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





