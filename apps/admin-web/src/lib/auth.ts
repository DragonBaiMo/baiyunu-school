/**
 * admin-web 简易认证状态（Phase 1a 仅路由守卫占位）。
 *
 * Phase 1b 起替换为真实 JWT：改走 BFF 的 /api/v1/auth/login，写入 httpOnly Cookie，
 * 移除 localStorage 方案以避免 XSS token 外泄。
 */
const TOKEN_KEY = 'bynu.admin.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      window.localStorage.removeItem(TOKEN_KEY);
    } else {
      window.localStorage.setItem(TOKEN_KEY, value);
    }
  } catch {
    /* 隐私模式/存储不可用时安静失败 */
  }
}

export function isAuthenticated(): boolean {
  return typeof getToken() === 'string' && getToken()!.length > 0;
}
