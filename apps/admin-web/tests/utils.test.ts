import { describe, it, expect } from 'vitest';
import { cn } from '../src/lib/utils.js';

describe('admin-web · utils', () => {
  it('cn 合并 className 并处理 tailwind 冲突', () => {
    expect(cn('px-2', false, 'px-4')).toBe('px-4');
    expect(cn('text-sm', undefined, 'font-bold')).toBe('text-sm font-bold');
  });
});
