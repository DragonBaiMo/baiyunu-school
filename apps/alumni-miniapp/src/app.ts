/**
 * Taro 4.x 小程序三 Tab 页面清单（Phase 1a 仅声明常量）。
 * Phase 1b 起：
 *   pages/home  — 首页
 *   pages/card  — 校友卡
 *   pages/mine  — 我的
 */

export const TABS = ['home', 'card', 'mine'] as const;
export type TabKey = (typeof TABS)[number];
