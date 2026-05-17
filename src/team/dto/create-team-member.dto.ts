import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Amanda Costa' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'amanda@arenahub.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ example: 'Reception', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
  @ApiProperty({ example: 'Convite Pending', enum: ['Active', 'Convite Pending'] })
  @IsEnum(['Active', 'Convite Pending'])
  status: string;
}





