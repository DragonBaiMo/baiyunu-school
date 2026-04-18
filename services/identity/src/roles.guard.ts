/**
 * 最小 RBAC：在 handler 上 `@Roles(...)` 声明必需角色；守卫读取请求头 `x-role` 做验证。
 * - 未声明 Roles 的路由视为无需鉴权
 * - `x-roles` 支持逗号分隔多个角色；`x-college-id` 供院级过滤
 *
 * 这是 M1 占位方案。Phase 2 接入 JWT 后，可将此守卫替换为 JwtAuthGuard + RolesGuard 组合。
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  applyDecorators,
} from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';

export const ROLES_METADATA_KEY = 'bynu:roles';
export const INTERNAL_METADATA_KEY = 'bynu:internal';

export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_METADATA_KEY, roles);

export const Internal = (): MethodDecorator & ClassDecorator =>
  applyDecorators(SetMetadata(INTERNAL_METADATA_KEY, true));

export interface ActorHeaders {
  id: string;
  roles: string[];
  collegeId?: string;
}

export function readActor(req: Request): ActorHeaders {
  const id = String(req.headers['x-user-id'] ?? 'anonymous');
  const rolesHeader = String(req.headers['x-roles'] ?? '');
  const roles = rolesHeader.split(',').map((r) => r.trim()).filter(Boolean);
  const collegeIdRaw = req.headers['x-college-id'];
  const collegeId = typeof collegeIdRaw === 'string' && collegeIdRaw ? collegeIdRaw : undefined;
  return collegeId === undefined ? { id, roles } : { id, roles, collegeId };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    if (!this.reflector) return true;
    const handler = ctx.getHandler();
    const cls = ctx.getClass();
    const required =
      this.reflector.get<string[]>(ROLES_METADATA_KEY, handler) ??
      this.reflector.get<string[]>(ROLES_METADATA_KEY, cls) ??
      [];
    if (required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const actor = readActor(req);
    const ok = required.some((r: string) => actor.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException(`需要角色之一：${required.join(', ')}`);
    }
    return true;
  }
}
