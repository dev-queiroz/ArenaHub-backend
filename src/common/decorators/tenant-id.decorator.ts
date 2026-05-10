import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator that extracts the tenantId (arenaId)
 * from the authenticated user in the request.
 *
 * Usage: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // The arenaId comes from the JWT payload (set by JwtStrategy)
    return request.user?.arenaId;
  },
);
