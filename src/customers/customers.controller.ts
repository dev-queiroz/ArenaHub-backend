import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
@ApiTags('Customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {} @Get()
  @ApiOperation({ summary: 'Listar todos os clientes da arena' })
  findAll(@TenantId() arenaId: string) {
    return this.customersService.findAll(arenaId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um cliente' })
  findOne(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.customersService.findOne(id, arenaId);
  }
  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cliente' })
  create(@TenantId() arenaId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(arenaId, dto);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente existente' })
  update(
    @Param('id') id: string,
    @TenantId() arenaId: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, arenaId, dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  remove(@Param('id') id: string, @TenantId() arenaId: string) {
    return this.customersService.remove(id, arenaId);
  }
}




