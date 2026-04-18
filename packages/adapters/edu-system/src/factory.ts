import { MockEduSystemAdapter } from './mock.js';
import type { IEduSystemAdapter } from './interface.js';

export function createEduSystemAdapter(
  provider: string = process.env['EDU_PROVIDER'] ?? 'mock',
): IEduSystemAdapter {
  switch (provider) {
    case 'mock':
      return new MockEduSystemAdapter();
    case 'rest_api':
    case 'file_import':
      throw new Error(`[edu-system] ${provider} 真实实现将在 Phase 2 完成`);
    default:
      throw new Error(`[edu-system] 未知 provider：${provider}`);
  }
}
