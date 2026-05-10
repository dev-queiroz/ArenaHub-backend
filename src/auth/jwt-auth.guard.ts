import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT authentication guard.
 * Apply to controllers/routes that require a valid JWT token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
