import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
export class UpdateSettingsDto {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() reservationReminder?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() paymentConfirmation?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() cancellationAlert?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() marketingCampaigns?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() pix?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() creditCard?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() debitCard?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() cash?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() bankTransfer?: boolean;
}




