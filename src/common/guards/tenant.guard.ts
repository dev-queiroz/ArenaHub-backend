import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
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
