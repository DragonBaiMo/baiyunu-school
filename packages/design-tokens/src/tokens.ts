/**
 * Design Tokens 单一事实源（Single Source of Truth）。
 *
 * 锚定契约：
 * - docs/ui/design-system.md
 * - .sisyphus/runs/2026-04-17-211321/design/MASTER.md
 *
 * 任何 Token 变更必须同时更新这两份契约文档并走 P3 流程评审，不得在代码侧私自漂移。
 */

export interface TokenTheme {
  light: string;
  dark: string;
}

export interface DesignTokens {
  color: {
    primitive: Record<string, string>;
    semantic: Record<string, TokenTheme>;
  };
  space: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  breakpoint: Record<string, string>;
  fontSize: Record<string, { size: string; lineHeight: string; weight: number }>;
  fontFamily: Record<string, string>;
  motion: Record<string, { duration: string; easing: string }>;
}

export const tokens: DesignTokens = {
  color: {
    primitive: {
      'color-navy-50': '#E6F3FB',
      'color-navy-500': '#005A9E',
      'color-navy-700': '#00375D',
      'color-cyan-500': '#04D5FF',
      'color-gold-500': '#D4A84B',
      'color-gold-300': '#F0C86E',
      'color-warm-red-500': '#E4572E',
      'color-warm-red-300': '#FF7A5C',
      'color-sky-500': '#0EA5E9',
      'color-sky-300': '#38BDF8',
    },
    semantic: {
      'color-bg-primary': { light: '#FFFFFF', dark: '#0F172A' },
      'color-bg-secondary': { light: '#F8FAFC', dark: '#1E293B' },
      'color-bg-elevated': { light: '#FFFFFF', dark: '#334155' },
      'color-text-primary': { light: '#0F172A', dark: '#F1F5F9' },
      'color-text-secondary': { light: '#475569', dark: '#94A3B8' },
      'color-text-disabled': { light: '#CBD5E1', dark: '#475569' },
      'color-border-default': { light: '#E2E8F0', dark: '#334155' },
      'color-border-strong': { light: '#94A3B8', dark: '#64748B' },
      'color-accent': { light: '#00375D', dark: '#04D5FF' },
      'color-interactive': { light: '#04D5FF', dark: '#00E5FF' },
      'color-danger': { light: '#EF4444', dark: '#F87171' },
      'color-success': { light: '#22C55E', dark: '#4ADE80' },
      'color-honor-gold': { light: '#D4A84B', dark: '#F0C86E' },
      'color-emotion-red': { light: '#E4572E', dark: '#FF7A5C' },
      'color-data-accent': { light: '#0EA5E9', dark: '#38BDF8' },
    },
  },
  space: {
    'space-1': '4px',
    'space-2': '8px',
    'space-3': '12px',
    'space-4': '16px',
    'space-6': '24px',
    'space-8': '32px',
    'space-12': '48px',
  },
  radius: {
    'radius-sm': '4px',
    'radius-md': '8px',
    'radius-lg': '12px',
    'radius-full': '9999px',
  },
  shadow: {
    'shadow-sm': '0 1px 2px rgba(0,0,0,.05)',
    'shadow-md': '0 4px 6px rgba(0,0,0,.07)',
    'shadow-lg': '0 10px 15px rgba(0,0,0,.1)',
    'shadow-xl': '0 20px 25px rgba(0,0,0,.15)',
  },
  breakpoint: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  fontSize: {
    'text-xs': { size: '12px', lineHeight: '16px', weight: 400 },
    'text-sm': { size: '14px', lineHeight: '20px', weight: 400 },
    'text-base': { size: '16px', lineHeight: '24px', weight: 400 },
    'text-lg': { size: '18px', lineHeight: '28px', weight: 500 },
    'text-xl': { size: '20px', lineHeight: '28px', weight: 600 },
    'text-2xl': { size: '24px', lineHeight: '32px', weight: 600 },
    'text-4xl': { size: '36px', lineHeight: '40px', weight: 700 },
  },
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Roboto, sans-serif',
    serif: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
    mono: 'ui-monospace, Consolas, "Courier New", monospace',
  },
  motion: {
    'motion-qr-rotate': { duration: '600ms', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    'motion-step-progress': { duration: '400ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    'motion-data-pulse': { duration: '1200ms', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    'motion-canvas-snap': { duration: '180ms', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  },
};

export default tokens;
