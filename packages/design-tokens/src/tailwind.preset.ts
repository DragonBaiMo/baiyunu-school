/**
 * Tailwind preset 构造器。
 * 使用：tailwind.config.ts 中 `presets: [buildTailwindPreset()]`
 */

import { tokens } from './tokens.js';

type TailwindPreset = {
  theme: {
    extend: {
      colors: Record<string, string | Record<string, string>>;
      spacing: Record<string, string>;
      borderRadius: Record<string, string>;
      boxShadow: Record<string, string>;
      screens: Record<string, string>;
      fontSize: Record<string, [string, { lineHeight: string; fontWeight: number }]>;
      fontFamily: Record<string, string[]>;
    };
  };
};

export function buildTailwindPreset(): TailwindPreset {
  const colors: Record<string, string | Record<string, string>> = {};
  for (const [k, v] of Object.entries(tokens.color.primitive)) {
    colors[k] = v;
  }
  for (const [k, v] of Object.entries(tokens.color.semantic)) {
    colors[k] = { DEFAULT: v.light, dark: v.dark };
  }

  const fontSize: Record<string, [string, { lineHeight: string; fontWeight: number }]> = {};
  for (const [k, v] of Object.entries(tokens.fontSize)) {
    fontSize[k] = [v.size, { lineHeight: v.lineHeight, fontWeight: v.weight }];
  }

  return {
    theme: {
      extend: {
        colors,
        spacing: tokens.space,
        borderRadius: tokens.radius,
        boxShadow: tokens.shadow,
        screens: tokens.breakpoint,
        fontSize,
        fontFamily: {
          sans: (tokens.fontFamily.sans ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          serif: (tokens.fontFamily.serif ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          mono: (tokens.fontFamily.mono ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        },
      },
    },
  };
}
