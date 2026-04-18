import { describe, it, expect } from 'vitest';
import { maskScore } from '../src/lib/format.js';

describe('alumni-h5 · format', () => {
  it('负数显示 --', () => expect(maskScore(-1)).toBe('--'));
  it('小于 9000 原样显示', () => expect(maskScore(888)).toBe('888'));
  it('大于等于 9000 按千显示', () => expect(maskScore(9500)).toBe('9k+'));
});
