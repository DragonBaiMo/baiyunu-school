/**
 * 占位：由 `pnpm gen:api` 产生完整 TS 类型定义。
 * 为避免 Phase 1a 首次安装前缺失文件导致导入失败，这里先提供最小类型桩。
 */

export type Health = {
  status: 'ok' | 'degraded' | 'fail';
  deps: { db: 'ok' | 'fail'; cache: 'ok' | 'fail' };
  version: string;
};
