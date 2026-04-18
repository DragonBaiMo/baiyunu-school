/**
 * donation RBAC，与 activity/workflow/portal-cms 对齐。
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';

export const DON_ROLES_METADATA_KEY = 'bynu:donation:roles';

export const RequirePerm = (
  ...roles: string[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(DON_ROLES_METADATA_KEY, roles);

export interface DonationActor {
  id: string;
  roles: string[];
}

export function readDonationActor(req: Request): DonationActor {
  const id = String(req.headers['x-user-id'] ?? 'anonymous');
  const rolesHeader = String(req.headers['x-roles'] ?? '');
  const roles = rolesHeader
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  return { id, roles };
}

@Injectable()
export class DonationRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const cls = ctx.getClass();
    const required =
      this.reflector.get<string[]>(DON_ROLES_METADATA_KEY, handler) ??
      this.reflector.get<string[]>(DON_ROLES_METADATA_KEY, cls) ??
      [];
    if (required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const actor = readDonationActor(req);
    const ok = required.some((r) => actor.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException(`需要角色之一：${required.join(', ')}`);
    }
    return true;
  }
}
