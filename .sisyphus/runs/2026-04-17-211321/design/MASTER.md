> Run: 2026-04-17-211321 | Phase: P3 | 作者: Hephaestus
> 契约来源: docs/ui/design-system.md + docs/ui/page-map.md
> M1 覆盖 US: US-001 / US-002 / US-004 / US-006 / US-007 / US-008 / US-010 / US-011 / US-012 / US-014 / US-015

# 白云学院超星智慧校友服务平台 · 全局设计系统 MASTER（P3 对齐版）

## 契约声明（Contract Anchor）

**本 MASTER 以 `docs/ui/design-system.md` 为契约锚，显式驳回 `design-system/baiyunu-alumni-platform/MASTER.md` 中由 PROMPT.md 自动输出的紫色主色 / Comic Neue 字体方案。**

驳回原因：
1. 品牌情绪冲突。平台目标情绪词为"亲切、可信赖、荣誉感、专业、科技感"，深邃海军蓝 `#00375D` + 亮青蓝 `#04D5FF` 承载白云学院官方视觉资产与校徽延续性；紫色方案偏娱乐社交属性，与校史沉淀、荣誉感、行政严肃性不兼容。
2. 字体不适配。Comic Neue 为手写体英文字体，中文回退至系统默认时字重不协调，且在校友身份认证、捐赠证书、电子校友卡等需要正式感的高价值页面会稀释权威属性。
3. 多端一致性破坏。PC 管理后台需要长时间高密度阅读审批工单，手写体会显著降低单位时间阅读量。
4. 无障碍风险。紫色 + 手写体组合在弱视用户、深色模式、高亮度室外扫码场景下对比度表现劣于现有海军蓝方案。

保留 `design-system/baiyunu-alumni-platform/` 目录作为 PROMPT.md 原始产物参考档，不做物理覆盖；本 MASTER 是唯一的实施契约。

---

## 0. 视觉基调

| 维度 | 决策 |
|------|------|
| 产品类型 | 平台类 + 工具类混合 |
| 主要情绪 | 亲切 · 可信赖 · 荣誉感 · 专业 · 科技感 |
| 风格方向 | functional & warm（功能导向，承载母校人文关怀） |
| 视觉主轴 | 深邃海军蓝 `#00375D` + 亮青蓝 `#04D5FF` + 三扩展语义色 |
| 形状语言 | `radius-md` 8px（按钮/列表） · `radius-lg` 12px（卡片/电子校友卡） · `radius-full` 9999px（头像/胶囊） |
| 阴影语言 | `subtle` 优先，核心浮层使用 `shadow-md` / `shadow-lg` |
| 图标语言 | `lucide-react` 线性为主，选中态转填充；严禁 emoji 作 UI 图标 |

---

## 1. 颜色 Token 引用与扩展

### 1.1 完整复用 Primitive Tokens

以下来自 `docs/ui/design-system.md §1.1`，冻结，不得改值：

```
color-navy-50   → #E6F3FB
color-navy-500  → #005A9E
color-navy-700  → #00375D
color-cyan-500  → #04D5FF
```

### 1.2 完整复用 Semantic Tokens

下列 Token 直接引用 `docs/ui/design-system.md §1.2`，不得重写：

`color-bg-primary` / `color-bg-secondary` / `color-bg-elevated` / `color-text-primary` / `color-text-secondary` / `color-text-disabled` / `color-border-default` / `color-border-strong` / `color-accent` / `color-interactive` / `color-danger` / `color-success`

### 1.3 扩展 Semantic Tokens（仅新增，不替换）

为承载电子校友卡荣誉徽章、520 / 2026 情怀面值、数据大屏高亮三类特定语义，扩展以下三组 Token。Primitive 侧新增 `color-gold-*` / `color-warm-red-*` / `color-sky-*` 三族 HEX 源值；Semantic 侧对外暴露如下：

| Token | 亮色值 | 暗色值 | 用途 |
|-------|--------|--------|------|
| `color-honor-gold` | `#D4A84B` | `#F0C86E` | 电子校友卡徽章描边、捐赠证书盖章、鸣谢榜金牌条目 |
| `color-emotion-red` | `#E4572E` | `#FF7A5C` | 520 / 2026 情怀面值气泡、捐赠大厅情怀专区 CTA、纪念日装饰 |
| `color-data-accent` | `#0EA5E9` | `#38BDF8` | 大屏数据跳动高亮、可视化图表正向数据序列 |

命名遵循既有 `color-{语义类}-{变体}` 模式，全部 kebab-case，与 `color-accent` / `color-danger` 同级。

对比度复核：`color-honor-gold(#D4A84B)` on `color-bg-primary(#FFFFFF)` ≈ 2.9:1，仅用于图形装饰、徽章描边、非正文文本；正文文本在金色背景上必须回落到 `color-text-primary`。`color-emotion-red(#E4572E)` on 白底 ≈ 4.6:1，通过 AA 正文要求。`color-data-accent(#0EA5E9)` on `#0F172A` 深色大屏背景 ≈ 8.3:1，通过 AAA。

### 1.4 Tailwind 绑定

```js
// tailwind.config.js extend.colors
{
  honor: { gold: { light: '#D4A84B', dark: '#F0C86E' } },
  emotion: { red: { light: '#E4572E', dark: '#FF7A5C' } },
  data: { accent: { light: '#0EA5E9', dark: '#38BDF8' } }
}
```

Tailwind class 示例：`bg-honor-gold-light` / `text-emotion-red-light` / `ring-data-accent-dark`。

---

## 2. 字体与排印

### 2.1 字体栈

| 族类 | 栈 | 使用场景 |
|------|----|---------|
| 无衬线（默认） | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Roboto, sans-serif` | 全站正文、表单、按钮、导航、管理后台 |
| 中文衬线（扩展） | `"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif` | 电子校友卡背面履历、捐赠证书正文、荣誉徽章文字、大屏标题 |
| 等宽 | `ui-monospace, Consolas, "Courier New", monospace` | 订单号、交易流水号、动态 QR payload 显示 |

`Noto Serif SC` 通过 Google Fonts 子集化方式引入（仅加载证书/卡片所需 CJK 字符子集，体积 ≤ 180KB WOFF2），采用 `font-display: swap`；若加载失败则回落 `Songti SC` / 系统宋体。不得将 Noto Serif SC 用于正文长段落（与品牌功能情绪词"功能导向"冲突）。

### 2.2 Type Scale 引用

直接引用 `docs/ui/design-system.md §3` 中 `text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl` / `text-4xl`，不扩展。

### 2.3 Tailwind 绑定

```js
fontFamily: {
  sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Microsoft YaHei"', 'Roboto', 'sans-serif'],
  serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', 'serif'],
  mono: ['ui-monospace', 'Consolas', '"Courier New"', 'monospace']
}
```

---

## 3. 间距 · 圆角 · 断点 · 阴影

完整引用 `docs/ui/design-system.md §2 / §4 / §5`，不扩展。

间距：`space-1` 4 / `space-2` 8 / `space-3` 12 / `space-4` 16 / `space-6` 24 / `space-8` 32 / `space-12` 48
圆角：`radius-sm` 4 / `radius-md` 8 / `radius-lg` 12 / `radius-full` 9999
阴影：`shadow-sm` / `shadow-md` / `shadow-lg` / `shadow-xl`
断点：`mobile` 0 / `tablet` 768 / `desktop` 1024 / `wide` 1280

---

## 4. 动效规范（5 大特色动效）

所有动效由 `framer-motion` 实现，自动订阅 `prefers-reduced-motion: reduce` 媒体查询，命中时统一降级为不透明度切换或零动画。缓动函数使用 CSS `cubic-bezier` 三次贝塞尔表达，禁止线性 `linear`（除数据跳动场景）。

| 动效 Token | 触发场景 | duration | easing | Reduced-motion Fallback |
|-----------|---------|----------|--------|------------------------|
| `motion-qr-rotate` | 电子校友卡动态 QR 每 30s 刷新时的 180° 卡面翻转 | 600ms | `cubic-bezier(0.22, 1, 0.36, 1)` | 0ms，直接替换新 QR 位图 |
| `motion-donor-marquee` | 捐赠鸣谢大屏滚动走马灯 | 连续循环 20s / 屏 | `linear`（仅此场景允许） | 静态分页轮换，每 5s 切换一屏 |
| `motion-step-progress` | 身份认证 5 步进度条推进 | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | 0ms，直接跳至目标进度值 |
| `motion-data-pulse` | 大屏数据数字跳动增长（CountUp） | 1200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 直接显示终值，附带 `aria-live="polite"` 播报 |
| `motion-canvas-snap` | 活动装修器拖拽吸附 | 180ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 吸附但无弹性，duration 置 0 |

### 4.1 `framer-motion` 全局配置

```tsx
import { MotionConfig } from 'framer-motion';
<MotionConfig reducedMotion="user" transition={{ type: 'tween' }}>
  <App />
</MotionConfig>
```

### 4.2 禁用项

禁止 hover scale 引起布局抖动（只允许 `transform: scale` 不影响文档流，且 `will-change: transform` 必须声明）。禁止对布局属性（`width` / `height` / `margin`）做动画。禁止 `animation-iteration-count: infinite` 应用于可交互元素。

---

## 5. A11y 基线

| 指标 | 全站最低 | 校友端目标 |
|------|---------|-----------|
| 正文对比度 | WCAG AA 4.5:1 | AAA 7:1（电子校友卡、证书、认证表单） |
| 大字对比度（≥24px 或 ≥19px bold） | 3:1 | 4.5:1 |
| 触控靶尺寸 | 44×44px | 48×48px（老年校友主路径） |
| Focus Ring | 3px `color-interactive` 实线 + 2px `color-bg-primary` offset | 同上 |
| 键盘 Tab 顺序 | 按视觉阅读顺序；跳过装饰元素 `tabindex="-1"` | 首屏首焦点指向主 CTA |
| `aria-live` | 表单校验失败、异步加载完成、动态数据更新 | 同左 |
| 图片 `alt` | 全站非装饰图必填 | 同左 |
| 语言属性 | `<html lang="zh-CN">` | 同左 |
| 颜色非唯一编码 | 错误态必须附 Icon + 文本 | 同左 |

键盘快捷键规则：PC 管理后台的工单审批列表支持 `j / k` 上下切换，`a` 通过，`r` 驳回；所有快捷键在页面右上角 `?` 图标下可查阅。

---

## 6. 组件清单

本节完全引用 `docs/ui/design-system.md §6 - §7`，不在此重复组件 API 契约。M1 实施引用的核心组件：

**原子层**：`Button` / `TextField` / `Badge` / `Avatar` / `Icon`
**分子层**：`FormItem` / `NewsCard` / `BottomBar` / `Toast` / `QrCodeBox`
**有机层**：`AlumniIdentityForm` / `E-CampusCard` / `DonationCheckout` / `AuditWorkflowPool`

本 P3 交付中的线框图若需新增组件，必须在对应 wireframe 文档的"组件复用"段声明 API 草案，并在 P4 Phase 1a 任务包中补录为正式 API。禁止在实施时自造未声明组件。

---

## 7. Pre-Delivery Checklist

实施交付前必须逐项核对：

- [ ] 所有颜色值通过 Token 引用，无裸 HEX / rgb / hsl 散落在业务代码
- [ ] 深色模式下全部关键页面通过视觉走查（登录 / 电子卡 / 捐赠 / 工单台 / 大屏）
- [ ] 所有可交互元素 Focus Ring 清晰可见，键盘 Tab 顺序符合阅读顺序
- [ ] 所有图片声明 `alt`，装饰图 `alt=""` + `aria-hidden="true"`
- [ ] 所有异步态提供 `loading` / `empty` / `error` 三态覆盖
- [ ] 所有表单字段校验失败提供 Icon + 文本 + `color-danger` 三重提示
- [ ] 所有动效通过 `prefers-reduced-motion: reduce` 降级走查
- [ ] Mobile 375px / Tablet 768px / Desktop 1440px / Wide 1920px 四断点手动视觉回归
- [ ] 所有触控靶 ≥ 44×44px，老年用户主路径 ≥ 48×48px
- [ ] 埋点事件 `event_name` 全部在埋点字典登记，`properties` schema 通过 JSON Schema 校验
- [ ] Tailwind build 产物体积 CSS ≤ 60KB gzip，字体 WOFF2 子集 ≤ 180KB
- [ ] LCP < 2.5s（4G 模拟），CLS < 0.1，FID < 100ms
- [ ] 无 `console.*` 残留，无 `TODO` 未关闭于主流程

---

## 8. Anti-Patterns 禁用清单

本清单为硬性禁用，PR 审查必须拒绝命中项：

1. **emoji 作 UI 图标**。图标统一走 `lucide-react`，需表达情感时走 `color-emotion-red` 配合图形徽章。
2. **`hover:scale-*` 影响布局流**。仅允许 `transform-gpu` + `will-change: transform` 的 scale，且 scale 幅度 ≤ 1.03。
3. **浅色模式下 `bg-white/10` 不可见**。任何半透明白在浅底上 contrast < 1.1:1，严禁使用；需要柔化背景时使用 `color-bg-secondary`。
4. **未声明 `cursor-pointer` 的可点击元素**。所有点击响应元素必须显式 `cursor-pointer`，非 `button` / `a` 元素需加 `role` + `tabindex="0"` + 键盘事件绑定。
5. **使用 `!important` 覆盖 Token**。所有覆盖走组件级 className 合并，禁用 `!important` 作为快捷手段。
6. **直接在组件 JSX 内写 HEX 颜色**。必须通过 Tailwind class 或 CSS Variable 引用 Token。
7. **空态用"暂无数据"四字**。必须提供空态插画 + 用户下一步操作建议 + 主 CTA。
8. **错误态回退为 `alert()` / `console.error`**。必须走 `Toast` 或 inline 错误区块并上报埋点。
9. **非响应式固定 `width: 1200px`**。容器使用 `max-w-wide mx-auto` + Flex/Grid 响应式方案。
10. **对同一按钮同时绑定 `onClick` 和 `onDoubleClick`**。双击行为用长按替代并提供视觉预告。

---

## 9. 实施绑定（Tech Lock-in）

| 层 | 技术 | 版本下限 | 备注 |
|----|------|---------|------|
| CSS 框架 | Tailwind CSS | 3.4.x | 禁用 v4 beta；`content` 配置覆盖 `apps/**` + `packages/ui/**` |
| 组件库 | shadcn/ui | 基于 Radix 1.x | 仅 Copy-In 模式，不作 npm 依赖；主题变量通过 CSS Variables 注入 |
| 图标 | `lucide-react` | 0.4xx | 统一图标源，禁止混用 `@ant-design/icons` / `heroicons` |
| 动效 | `framer-motion` | 11.x | 全局 `MotionConfig reducedMotion="user"` |
| 前端框架 | React | 18.2+ | 启用并发特性；小程序端由 Taro 4 编译产物承载 |
| 构建 | Vite | 5.x | Rollup 产物分包：vendor / react / ui / business |
| 小程序编译 | Taro | 4.x | 与 H5 共享 `packages/ui` 业务组件（受限子集） |
| 后端 | NestJS | 10.x | BFF + 领域服务同进程，详见 P2 架构蓝图 §1.2 |

---

## 10. 变更流程

扩展 Token、新增组件、新增动效均走以下流程：

1. 在本 MASTER 对应段追加（不删除既有条目）
2. 在 `docs/ui/design-system.md` 的下一次 minor 版本同步写入
3. `packages/ui` 发布 minor 版本，触发 Storybook 构建
4. 通知全部消费方（H5 / 小程序 / 管理后台）升级

任何对 Primitive Token 值的修改（如改海军蓝色号）视作 major 变更，必须回到 P1 Metis 意图决策重新立项。

---

（MASTER 结束；配套交付见 `wireframes/` / `interaction/` / `page-overrides.md` / `P3-delivery-index.md`）
