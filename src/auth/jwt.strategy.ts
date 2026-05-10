import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Passport strategy.
 * Extracts and validates the JWT from the Authorization Bearer header.
 * The validated payload is injected into request.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  /**
   * Called after JWT verification succeeds.
   * Returns the payload which becomes request.user.
   */
  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    arenaId: string;
  }) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      arenaId: payload.arenaId,
    };
  }
}
