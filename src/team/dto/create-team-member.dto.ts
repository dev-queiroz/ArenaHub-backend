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
  @ApiProperty({ example: 'Recepcao', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
  @ApiProperty({ example: 'Convite pendente', enum: ['Ativo', 'Convite pendente'] })
  @IsEnum(['Ativo', 'Convite pendente'])
  status: string;
}
