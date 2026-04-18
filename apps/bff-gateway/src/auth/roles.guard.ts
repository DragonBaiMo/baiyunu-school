/**
 * RBAC Guard：从请求 user.roles 中检查是否命中 @Roles(...) 装饰器声明的角色。
 * 与 JwtAuthGuard 配合使用：JWT 通过后注入 req.user，再由本 Guard 鉴权。
 */

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@bynu/auth';
import { ROLES_KEY } from './roles.decorator.js';

interface RequestWithUser {
  user?: { roles?: Role[]; sub?: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector 仅做元数据读取，无依赖、无副作用，本地实例化避免被 @UseGuards(Class) 路径下的 DI 漏注入。
  private readonly reflector = new Reflector();

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const roles = req.user?.roles ?? [];
    const ok = required.some((r) => roles.includes(r));
    if (!ok) throw new ForbiddenException(`缺少所需角色: ${required.join(',')}`);
    return true;
  }
}
