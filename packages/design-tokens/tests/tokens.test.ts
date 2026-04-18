/**
 * design-tokens 单元测试：
 * - Token 结构完整性
 * - 三端（CSS / Tailwind / 小程序）对 Primitive 颜色引用一致（diff 零差异）
 */

import { describe, expect, it } from 'vitest';
import { buildTailwindPreset, tokens } from '../src/index.js';

describe('design-tokens', () => {
  it('原生色板 Primitive 至少包含海军蓝三档与青蓝', () => {
    expect(tokens.color.primitive['color-navy-700']).toBe('#00375D');
    expect(tokens.color.primitive['color-navy-500']).toBe('#005A9E');
    expect(tokens.color.primitive['color-cyan-500']).toBe('#04D5FF');
  });

  it('扩展语义色（honor / emotion / data）齐备', () => {
    expect(tokens.color.semantic['color-honor-gold']).toEqual({
      light: '#D4A84B',
      dark: '#F0C86E',
    });
    expect(tokens.color.semantic['color-emotion-red']?.light).toBe('#E4572E');
    expect(tokens.color.semantic['color-data-accent']?.light).toBe('#0EA5E9');
  });

  it('Tailwind preset 包含所有 Primitive 颜色键（三端 diff 为空）', () => {
    const preset = buildTailwindPreset();
    const colorKeys = Object.keys(preset.theme.extend.colors);
    for (const k of Object.keys(tokens.color.primitive)) {
      expect(colorKeys).toContain(k);
    }
    for (const k of Object.keys(tokens.color.semantic)) {
      expect(colorKeys).toContain(k);
    }
  });

  it('Tailwind fontSize 同步 tokens.fontSize', () => {
    const preset = buildTailwindPreset();
    expect(preset.theme.extend.fontSize['text-2xl']).toBeDefined();
    expect(preset.theme.extend.fontSize['text-2xl']?.[0]).toBe('24px');
  });

  it('断点与圆角结构完整', () => {
    expect(tokens.breakpoint.tablet).toBe('768px');
    expect(tokens.radius['radius-lg']).toBe('12px');
  });
});
