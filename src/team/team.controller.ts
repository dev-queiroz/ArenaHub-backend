import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { TeamService } from './team.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@ApiTags('Team')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: 'Listar membros da equipe' })
  findAll(@TenantId() arenaId: string) {
    return this.teamService.findAll(arenaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um membro' })
  findOne(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.teamService.findOne(id, arenaId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar membro à equipe' })
  create(@TenantId() arenaId: string, @Body() dto: CreateTeamMemberDto) {
    return this.teamService.create(arenaId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar membro da equipe' })
  update(
    @Param('id') id: string,
    @TenantId() arenaId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamService.update(id, arenaId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover membro da equipe' })
  remove(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.teamService.remove(id, arenaId);
  }
}
