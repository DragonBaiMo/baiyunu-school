/**
 * activity RBAC，与 workflow/portal-cms/identity/organization 对齐。
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

export const ACT_ROLES_METADATA_KEY = 'bynu:activity:roles';

export const RequirePerm = (
  ...roles: string[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(ACT_ROLES_METADATA_KEY, roles);

export interface ActivityActor {
  id: string;
  roles: string[];
}

export function readActivityActor(req: Request): ActivityActor {
  const id = String(req.headers['x-user-id'] ?? 'anonymous');
  const rolesHeader = String(req.headers['x-roles'] ?? '');
  const roles = rolesHeader
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  return { id, roles };
}

@Injectable()
export class ActivityRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const cls = ctx.getClass();
    const required =
      this.reflector.get<string[]>(ACT_ROLES_METADATA_KEY, handler) ??
      this.reflector.get<string[]>(ACT_ROLES_METADATA_KEY, cls) ??
      [];
    if (required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const actor = readActivityActor(req);
    const ok = required.some((r: string) => actor.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException(`需要角色之一：${required.join(', ')}`);
    }
    return true;
  }
}
