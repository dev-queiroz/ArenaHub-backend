import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

/**
 * CourtsController — CRUD endpoints for sports courts.
 * All routes require JWT auth and tenant context.
 */
@ApiTags('Courts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as quadras da arena' })
  findAll(@TenantId() arenaId: string) {
    return this.courtsService.findAll(arenaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma quadra' })
  findOne(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.courtsService.findOne(id, arenaId);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar nova quadra' })
  create(@TenantId() arenaId: string, @Body() dto: CreateCourtDto) {
    return this.courtsService.create(arenaId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar quadra existente' })
  update(
    @Param('id') id: string,
    @TenantId() arenaId: string,
    @Body() dto: UpdateCourtDto,
  ) {
    return this.courtsService.update(id, arenaId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir quadra' })
  remove(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.courtsService.remove(id, arenaId);
  }
}
