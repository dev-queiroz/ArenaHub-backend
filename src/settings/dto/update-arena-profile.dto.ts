import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';
export class UpdateArenaProfileDto {
  @ApiPropertyOptional({ example: 'ArenaHub Central' })
  @IsString()
  @IsOptional()
  arenaName?: string;
  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsString()
  @IsOptional()
  taxId?: string;
  @ApiPropertyOptional({ example: 'contato@arenahub.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
  @ApiPropertyOptional({ example: '(11) 99887-7665' })
  @IsString()
  @IsOptional()
  phone?: string;
  @ApiPropertyOptional({ example: 'Rua das Palmeiras, 450' })
  @IsString()
  @IsOptional()
  address?: string;
}
