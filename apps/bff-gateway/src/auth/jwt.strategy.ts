/**
 * Passport JWT 策略：从 Authorization: Bearer <token> 提取并校验。
 * payload 形如 { sub, roles: Role[], type: 'access' }（与 @bynu/auth 对齐）。
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadConfig } from '@bynu/config';
import type { Role } from '@bynu/auth';

export interface JwtPayload {
  sub: string;
  roles: Role[];
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  sub: string;
  roles: Role[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? loadConfig().JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return { sub: payload.sub, roles: payload.roles ?? [] };
  }
}
