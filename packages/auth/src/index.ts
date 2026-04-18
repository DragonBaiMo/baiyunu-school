/**
 * JWT 与 RBAC 共享工具：
 * - `signAccessToken` / `signRefreshToken`
 * - `verifyToken`（统一校验）
 * - RBAC 角色字面量枚举（与 P2 §4.3 对齐）
 */

import jwt from 'jsonwebtoken';

export const ROLES = [
  'super-admin',
  'portal-admin',
  'identity-reviewer',
  'activity-runner',
  'donation-ops',
  'org-admin',
  'readonly',
] as const;
export type Role = (typeof ROLES)[number];

export interface AccessPayload {
  sub: string;
  roles: Role[];
  type: 'access';
}

export interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

export type TokenPayload = AccessPayload | RefreshPayload;

export interface SignOptions {
  secret: string;
  expiresInSec: number;
}

export function signAccessToken(sub: string, roles: Role[], opts: SignOptions): string {
  const payload: AccessPayload = { sub, roles, type: 'access' };
  return jwt.sign(payload, opts.secret, { expiresIn: opts.expiresInSec });
}

export function signRefreshToken(sub: string, opts: SignOptions): string {
  const payload: RefreshPayload = { sub, type: 'refresh' };
  return jwt.sign(payload, opts.secret, { expiresIn: opts.expiresInSec });
}

export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string') {
    throw new Error('[auth] Token payload 非对象');
  }
  return decoded as unknown as TokenPayload;
}

export function hasRole(payload: AccessPayload, required: Role): boolean {
  return payload.roles.includes(required);
}
