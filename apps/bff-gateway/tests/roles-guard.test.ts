import { describe, it, expect } from 'vitest';
import { RolesGuard } from '../src/auth/roles.guard.js';
import type { ExecutionContext } from '@nestjs/common';

function buildCtx(roles: string[], required: unknown): ExecutionContext {
  // 伪造装饰器元数据注入
  const handler = (): void => undefined;
  Reflect.defineMetadata('roles', required, handler);
  return {
    getHandler: () => handler,
    getClass: () => class X {},
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles } }),
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({}) as never,
    switchToWs: () => ({}) as never,
    getType: () => 'http' as never,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('未设定 roles 时放行', () => {
    const guard = new RolesGuard();
    expect(guard.canActivate(buildCtx([], undefined))).toBe(true);
  });

  it('命中所需角色放行，不命中抛 ForbiddenException', () => {
    const guard = new RolesGuard();
    expect(guard.canActivate(buildCtx(['portal-admin'], ['portal-admin']))).toBe(true);
    expect(() => guard.canActivate(buildCtx(['readonly'], ['portal-admin']))).toThrow();
  });
});
