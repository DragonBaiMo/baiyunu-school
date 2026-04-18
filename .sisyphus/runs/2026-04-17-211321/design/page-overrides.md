> Run: 2026-04-17-211321 | Phase: P3 | 作者: Hephaestus
> 契约来源: docs/ui/design-system.md + design/MASTER.md
> M1 覆盖 US: US-001 / US-006 / US-008 / US-012 / US-014 / US-015

# 页面级 Override · 偏离 MASTER 的局部规则

本文件列出 5 个关键页面偏离全局 MASTER 的 UI 规则。所有未声明为 Override 的规则一律以 `design/MASTER.md` 为准。Override 只允许偏离、不得颠覆 Primitive Token 值。

---

## 1. 电子校友卡（Alumni Card）

**偏离项**

- **强制深色模式**：本页忽略系统主题切换，常驻深色背景 `color-bg-primary-dark (#0F172A)`；进入页面前保存原主题，退出页面恢复。
- **荣誉金描边**：卡面使用 2px `color-honor-gold-dark (#F0C86E)` 描边 + 内发光 `box-shadow: inset 0 0 16px rgba(240,200,110,0.35)`；禁用全局 `shadow-md` / `shadow-lg`。
- **暗背景发光 QR**：QR 背景为纯白 `#FFFFFF`，外围 12px padding 的金色辉光环；对比度目标 ≥ 10:1 以保证室外扫描。
- **字体**：卡面持卡人姓名放大至 `text-2xl` + 字重 600 + `font-serif (Noto Serif SC)`；其他信息仍使用系统无衬线。
- **禁用**：禁用普通卡片 shadow；禁用 hover 态（移动端主场景）；禁用 Banner / BottomBar 同框展示。
- **动效**：翻转使用 `motion-qr-rotate` Token；`prefers-reduced-motion` 时改为横向滑入 200ms。
- **亮度**：小程序端强制 `wx.setScreenBrightness({ value: 1 })`，H5 端弹出一次性提示。

---

## 2. 捐赠大厅（Donation Hall）

**偏离项**

- **CTA 颜色替换**：本页项目详情"立即捐赠"主 CTA 使用 `color-emotion-red (#E4572E / 深色 #FF7A5C)` 替代全局 `color-accent`；hover 态 +8% luminance。
- **情怀面值脉冲**：520 / 2026 面值按钮持续 `motion-data-pulse` 2s 循环脉冲（呼吸式阴影 `box-shadow` 变化），非 infinite 而为 5 次后停止，避免无障碍告警；其他面值静态。
- **证书区字体**：证书预览区全部文案切换为 `font-serif (Noto Serif SC)`，金额数字使用等宽字体 `font-mono` 突出金额数字严肃感；证书四角装饰云纹使用 `color-honor-gold`。
- **鸣谢大屏**：投影模式使用专用 `color-bg-primary-dark (#0F172A)` + `color-data-accent-dark (#38BDF8)` 数字高亮，金色滚动条幅使用 `color-honor-gold-dark`。
- **禁用**：禁用全局 Banner 轮播组件（避免与情绪高峰场景冲突）；禁用 hover scale ≥ 1.05。

---

## 3. 微门户首页（Portal Home）

**偏离项**

- **金刚区高亮**：小程序端金刚区首行 5 个高频入口的图标色使用 `color-interactive (#04D5FF)`；未认证用户点击拦截时图标切换为 `color-text-secondary` 灰度态 + 锁图标覆盖。
- **Banner 交互**：PC 端 Banner 悬停放大幅度收窄至 `scale(1.02)`，避免 1440px 屏触发布局抖动；移动端禁用 hover。
- **LCP 优化**：首屏 Banner 首图使用 WebP + `fetchpriority="high"` + 骨架屏 Token；金刚区图标内联 SVG Sprite；首屏 CSS 内联 ≤ 14KB。
- **底部 TabBar**：小程序端底栏使用 `backdrop-blur` + `color-bg-elevated` 半透明；PC 端无 TabBar。
- **禁用**：禁用自动弹窗广告；禁用非首帧加载的大图背景。

---

## 4. 身份认证漏斗（Identity Onboarding）

**偏离项**

- **单焦点布局**：隐藏全局顶栏（搜索/消息/头像）、BottomBar、FAB；仅保留右上角"保存草稿"与"退出"。
- **进度条永驻**：顶部 5 步进度条在所有子步骤下常驻，使用 `motion-step-progress` Token；progress-dot 激活色 `color-accent`，已完成 `color-success`。
- **错误态文案**：校验失败文案使用柔和措辞（"请再核对一下……"而非"错误：非法输入"），色值仍为 `color-danger`，但字号保持 `text-sm` 不放大。
- **背景**：PC 端背景采用 `color-bg-secondary → color-bg-primary` 线性渐变，表单卡片居中宽度 `max-w-[640px]`。
- **键盘优先**：每步表单自动聚焦第一可编辑字段；Tab 顺序严格自上而下；Enter 默认触发"下一步"。
- **禁用**：禁用任何跳转到外站链接；禁用广告 slot；禁用第三方 SDK 监听。

---

## 5. 一站式办事大厅 · 日历组件（Workflow Hall Calendar）

**偏离项**

- **严格色规**：日历组件禁止自定义单元格色彩覆盖，所有余量着色必须使用以下映射：
  - 余量充足（> 40%）→ `color-success`
  - 余量紧张（10%–40%）→ `color-accent`
  - 满额 → `color-text-disabled`
  - 不可约 → `color-border-default` + 斜线纹
  - 所选态 → `color-accent` + 2px `color-border-strong` 边框
- **冲突告警**：时间冲突态使用 `color-danger` 描边 + 左上角 `AlertTriangle` 图标；不仅仅依赖颜色，必须有 Icon + 文本 "与您已有预约冲突"。
- **字体**：日期数字使用等宽 `font-mono` 以保证网格对齐。
- **禁用**：禁用日历上的节日装饰色；禁用农历副文本（M1 不支持国际化切换）；禁用悬停时弹出的工具提示使用 `bg-white/10`（见 MASTER §8 禁用项）。
- **键盘**：方向键切换日期；Enter 选中；PageUp/PageDown 切换月份；Home / End 跳转月首/月末。
