import { describe, it, expect } from 'vitest';
import { createStuAffairsAdapter, MockStuAffairsAdapter } from '../src/index.js';

describe('@bynu/adapter-stu-affairs · Mock', () => {
  it('queryAwards 返回对应身份证的奖项，缺省时为空', async () => {
    const a = new MockStuAffairsAdapter();
    expect((await a.queryAwards('110101199001010001'))[0]?.title).toBe('国家奖学金');
    expect(await a.queryAwards('000')).toEqual([]);
  });

  it('factory 切换', () => {
    expect(createStuAffairsAdapter('mock')).toBeInstanceOf(MockStuAffairsAdapter);
    expect(() => createStuAffairsAdapter('unknown')).toThrow();
  });
});
