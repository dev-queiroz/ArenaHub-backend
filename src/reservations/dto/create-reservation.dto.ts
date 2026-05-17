import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsNumber, IsEnum,
  IsOptional, IsDateString, Min,
} from 'class-validator';
import { ReservationStatus } from '@prisma/client';
export class CreateReservationDto {
  @ApiProperty({ example: 'customer-uuid-here' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
  @ApiProperty({ example: 'court-uuid-here' })
  @IsString()
  @IsNotEmpty()
  courtId: string;
  @ApiProperty({ example: 'Padel' })
  @IsString()
  @IsNotEmpty()
  sport: string;
  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  @IsNotEmpty()
  date: string;
  @ApiProperty({ example: '18:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;
  @ApiProperty({ example: '19:30' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(0)
  amount: number;
  @ApiProperty({
    example: 'Pending',
    enum: ReservationStatus,
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isOpen?: boolean;
  @ApiPropertyOptional({ example: 'Cliente prefere material premium.' })
  @IsString()
  @IsOptional()
  notes?: string;
}





