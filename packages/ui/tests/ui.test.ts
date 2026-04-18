import { describe, it, expect } from 'vitest';
import { BRAND, cx } from '../src/index.js';

describe('@bynu/ui', () => {
  it('cx 过滤假值并以空格拼接', () => {
    expect(cx('a', false, 'b', undefined, '', 'c')).toBe('a b c');
  });

  it('BRAND 常量含产品名', () => {
    expect(BRAND.productName).toContain('校友');
  });
});
