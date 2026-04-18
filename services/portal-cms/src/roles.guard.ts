/**
 * portal-cms 最小 RBAC：与 identity 保持同一模式。
 * - `@RequirePerm(...roles)` 在 handler 上声明所需角色
 * - `x-roles` 请求头携带以逗号分隔的角色
 * - 未声明 RequirePerm 的路由视为无需鉴权
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

export const CMS_ROLES_METADATA_KEY = 'bynu:portal-cms:roles';

export const RequirePerm = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(CMS_ROLES_METADATA_KEY, roles);

export interface CmsActor {
  id: string;
  roles: string[];
}

export function readCmsActor(req: Request): CmsActor {
  const id = String(req.headers['x-user-id'] ?? 'anonymous');
  const rolesHeader = String(req.headers['x-roles'] ?? '');
  const roles = rolesHeader
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  return { id, roles };
}

@Injectable()
export class CmsRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const cls = ctx.getClass();
    const required =
      this.reflector.get<string[]>(CMS_ROLES_METADATA_KEY, handler) ??
      this.reflector.get<string[]>(CMS_ROLES_METADATA_KEY, cls) ??
      [];
    if (required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const actor = readCmsActor(req);
    const ok = required.some((r: string) => actor.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException(`需要角色之一：${required.join(', ')}`);
    }
    return true;
  }
}
