import { describe, it, expect } from 'vitest';
import { createEduSystemAdapter, MockEduSystemAdapter } from '../src/index.js';

describe('@bynu/adapter-edu-system · Mock', () => {
  it('queryAlumni 返回 fixture 数据或 null', async () => {
    const a = new MockEduSystemAdapter();
    const hit = await a.queryAlumni('110101199001010001');
    expect(hit?.name).toBe('王昭然');
    const miss = await a.queryAlumni('000');
    expect(miss).toBeNull();
  });

  it('factory 支持 mock，未知 provider 抛错', () => {
    expect(createEduSystemAdapter('mock')).toBeInstanceOf(MockEduSystemAdapter);
    expect(() => createEduSystemAdapter('unknown')).toThrow();
  });
});
