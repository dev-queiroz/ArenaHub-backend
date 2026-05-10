import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * AuthController handles authentication endpoints:
 * login, profile retrieval, and profile update.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Authenticates user and returns JWT token.
   */
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/auth/register
   * Registers a new arena and owner.
   */
  @Post('register')
  @ApiOperation({ summary: 'Registrar uma nova arena e proprietário' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * GET /api/auth/profile
   * Returns the profile of the authenticated user.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  /**
   * PUT /api/auth/profile
   * Updates the profile of the authenticated user.
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  async updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; email?: string; phone?: string },
  ) {
    return this.authService.updateProfile(req.user.sub, body);
  }
}
