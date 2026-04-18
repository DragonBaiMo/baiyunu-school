import { MockStuAffairsAdapter } from './mock.js';
import type { IStuAffairsAdapter } from './interface.js';

export function createStuAffairsAdapter(
  provider: string = process.env['STU_PROVIDER'] ?? 'mock',
): IStuAffairsAdapter {
  switch (provider) {
    case 'mock':
      return new MockStuAffairsAdapter();
    case 'real':
      throw new Error('[stu-affairs] real 将在 Phase 2 完成');
    default:
      throw new Error(`[stu-affairs] 未知 provider：${provider}`);
  }
}
