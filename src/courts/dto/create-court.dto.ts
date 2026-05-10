import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsNumber, IsEnum,
  IsOptional, IsArray, Min,
} from 'class-validator';
import { CoverType, CourtStatus } from '@prisma/client';

export class CreateCourtDto {
  @ApiProperty({ example: 'Quadra 05' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Padel' })
  @IsString()
  @IsNotEmpty()
  sport: string;

  @ApiProperty({ example: 'Aberta', enum: CoverType })
  @IsEnum(CoverType)
  coverType: CoverType;

  @ApiPropertyOptional({ example: '05001-000' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @ApiPropertyOptional({ example: 'Disponivel', enum: CourtStatus })
  @IsEnum(CourtStatus)
  @IsOptional()
  status?: CourtStatus;

  @ApiPropertyOptional({ example: ['Iluminacao LED', 'Arquibancada'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
}
