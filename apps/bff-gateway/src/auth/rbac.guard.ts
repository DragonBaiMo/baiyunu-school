/**
 * RBAC Guard（代理路由用）：
 * - 从 `@SetMetadata('roles', ['admin'])` 读取所需角色；空集合放行。
 * - req.user.roles 取自 JWT payload（经 JwtStrategy 注入）。
 * - 缺失 / 不匹配 → ForbiddenException（由 ProblemDetailsFilter 统一转 Problem Details）。
 *
 * 与 `RolesGuard` 区别：RolesGuard 绑定 `@bynu/auth` 的 Role 字面量，用于原生 /ping 路由；
 * RbacGuard 接受任意字符串角色（代理场景下上游可能使用非枚举角色名）。
 */

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RequestWithUser {
  user?: { roles?: readonly string[]; sub?: string };
}

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly reflector = new Reflector();

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>('roles', [
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
