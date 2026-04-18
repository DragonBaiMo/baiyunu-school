import { MockESignAdapter } from './mock.js';
import type { IESignAdapter } from './interface.js';

export function createESignAdapter(
  provider: string = process.env['ESIGN_PROVIDER'] ?? 'mock',
): IESignAdapter {
  switch (provider) {
    case 'mock':
      return new MockESignAdapter();
    case 'fadada':
    case 'esign_cn':
      throw new Error(`[e-sign] ${provider} 将在 Phase 2 完成`);
    default:
      throw new Error(`[e-sign] 未知 provider：${provider}`);
  }
}
