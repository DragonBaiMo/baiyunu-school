import { MockChaoxingSsoAdapter } from './mock.js';
import type { IChaoxingSsoAdapter } from './interface.js';

export function createChaoxingSsoAdapter(
  provider: string = process.env['CHAOXING_PROVIDER'] ?? 'mock',
): IChaoxingSsoAdapter {
  switch (provider) {
    case 'mock':
      return new MockChaoxingSsoAdapter();
    case 'oauth2':
      throw new Error('[chaoxing] oauth2 将在 Phase 2 完成');
    default:
      throw new Error(`[chaoxing] 未知 provider：${provider}`);
  }
}
