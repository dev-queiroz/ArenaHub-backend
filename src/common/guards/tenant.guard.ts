import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard that ensures the request has a valid tenantId (arenaId).
 * Relies on JwtAuthGuard having already populated request.user.
 * If the user doesn't belong to any arena, access is denied.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const arenaId = request.user?.arenaId;

    if (!arenaId) {
      throw new ForbiddenException(
        'Contexto de tenant não encontrado. Faça login com um usuário vinculado a uma arena.',
      );
    }

    return true;
  }
}
