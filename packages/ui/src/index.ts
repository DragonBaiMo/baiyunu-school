/**
 * 共享 UI 组件薄封装（Phase 1a 只提供纯函数 classname 工具，避免 DOM 依赖）。
 * Phase 1b 起由 apps/admin-web 与 alumni-h5 向本包沉淀 shadcn 二次封装组件。
 */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');
}

export const BRAND = {
  productName: '白云学院智慧校友服务平台',
  version: '0.1.0-alpha',
} as const;
