/**
 * workflow RBAC，与 portal-cms/identity/organization 对齐。
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

export const WF_ROLES_METADATA_KEY = 'bynu:workflow:roles';

export const RequirePerm = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(WF_ROLES_METADATA_KEY, roles);

export interface WorkflowActor {
  id: string;
  roles: string[];
}

export function readWorkflowActor(req: Request): WorkflowActor {
  const id = String(req.headers['x-user-id'] ?? 'anonymous');
  const rolesHeader = String(req.headers['x-roles'] ?? '');
  const roles = rolesHeader
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  return { id, roles };
}

@Injectable()
export class WorkflowRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const cls = ctx.getClass();
    const required =
      this.reflector.get<string[]>(WF_ROLES_METADATA_KEY, handler) ??
      this.reflector.get<string[]>(WF_ROLES_METADATA_KEY, cls) ??
      [];
    if (required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const actor = readWorkflowActor(req);
    const ok = required.some((r: string) => actor.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException(`需要角色之一：${required.join(', ')}`);
    }
    return true;
  }
}
