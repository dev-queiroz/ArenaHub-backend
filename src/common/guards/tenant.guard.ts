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
        'Tenant context not found. Log in with a user linked to an arena.',
      );
    }
    return true;
  }
}





