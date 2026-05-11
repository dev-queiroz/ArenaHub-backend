import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsEmail, IsEnum,
  IsOptional,
} from 'class-validator';
import { CustomerType, PlayerLevel } from '@prisma/client';
export class CreateCustomerDto {
  @ApiProperty({ example: 'Leonardo Albuquerque' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'leo@arenahub.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ example: '(11) 98844-3322' })
  @IsString()
  @IsNotEmpty()
  phone: string;
  @ApiPropertyOptional({ example: 'Mensalista', enum: CustomerType })
  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;
  @ApiPropertyOptional({ example: 'Iniciante', enum: PlayerLevel })
  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel;
  @ApiPropertyOptional({ example: 'Ativo' })
  @IsString()
  @IsOptional()
  status?: string;
  @ApiPropertyOptional({ example: 'Padel' })
  @IsString()
  @IsOptional()
  favoriteSport?: string;
  @ApiPropertyOptional({ example: 'Cliente VIP' })
  @IsString()
  @IsOptional()
  notes?: string;
}
