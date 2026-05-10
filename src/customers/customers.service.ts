import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

/**
 * CustomersService handles all business logic for customer management.
 * All queries are scoped by arenaId (multi-tenant isolation).
 */
@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists all customers belonging to the given arena.
   */
  async findAll(arenaId: string) {
    return this.prisma.customer.findMany({
      where: { arenaId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Finds a single customer by ID, scoped to the arena.
   */
  async findOne(id: string, arenaId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, arenaId },
    });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  /**
   * Creates a new customer for the given arena.
   */
  async create(arenaId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        arenaId,
      },
    });
  }

  /**
   * Updates an existing customer, ensuring tenant isolation.
   */
  async update(id: string, arenaId: string, dto: UpdateCustomerDto) {
    await this.findOne(id, arenaId);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Removes a customer, ensuring tenant isolation.
   */
  async remove(id: string, arenaId: string) {
    await this.findOne(id, arenaId);
    return this.prisma.customer.delete({ where: { id } });
  }
}
