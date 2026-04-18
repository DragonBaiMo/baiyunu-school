import { MockAccessControlAdapter } from './mock.js';
import type { IAccessControlAdapter } from './interface.js';

export function createAccessControlAdapter(
  provider: string = process.env['ACL_PROVIDER'] ?? 'mock',
): IAccessControlAdapter {
  switch (provider) {
    case 'mock':
      return new MockAccessControlAdapter();
    case 'wiegand_http':
      throw new Error('[acl] wiegand_http 将在 Phase 2 完成');
    default:
      throw new Error(`[acl] 未知 provider：${provider}`);
  }
}
