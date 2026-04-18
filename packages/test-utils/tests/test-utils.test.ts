import { describe, it, expect } from 'vitest';
import { buildSyntheticAlumni } from '../src/index.js';

describe('@bynu/test-utils', () => {
  it('buildSyntheticAlumni 默认生成 5 条且字段齐备', () => {
    const list = buildSyntheticAlumni();
    expect(list).toHaveLength(5);
    expect(list[0]?.name).toBeTruthy();
    expect(list[0]?.phone).toMatch(/^138/);
  });
});
