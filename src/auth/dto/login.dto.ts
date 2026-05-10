import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for user login.
 */
export class LoginDto {
  @ApiProperty({ example: 'admin@arenahub.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Informe um email válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'arenahub', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}
