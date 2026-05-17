import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {} 
  async findAll(arenaId: string) {
    return this.prisma.customer.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });
  }
  async findOne(id: string, arenaId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, arenaId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }
  async create(arenaId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        arenaId,
      },
    });
  }
  async update(id: string, arenaId: string, dto: UpdateCustomerDto) {
    await this.findOne(id, arenaId);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }
  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);
    return this.prisma.customer.delete({ where: { id } });
  }
}





