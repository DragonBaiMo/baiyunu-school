/**
 * 角色装饰器：与 RolesGuard 配合执行 RBAC。
 * 复用 @bynu/auth 的 Role 字面量枚举。
 */

import { SetMetadata } from '@nestjs/common';
import type { Role } from '@bynu/auth';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
