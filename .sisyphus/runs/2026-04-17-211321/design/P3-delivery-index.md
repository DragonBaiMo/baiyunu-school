> Run: 2026-04-17-211321 | Phase: P3 | 作者: Hephaestus
> 契约来源: docs/ui/design-system.md + docs/ui/page-map.md
> M1 覆盖 US: US-001 / US-002 / US-004 / US-006 / US-007 / US-008 / US-010 / US-011 / US-012 / US-014 / US-015

# P3 交付总览 · 白云学院超星智慧校友服务平台

## 1. 交付物索引（13 份）

| # | 路径 | 摘要 |
|---|------|------|
| 1 | `.sisyphus/runs/2026-04-17-211321/design/MASTER.md` | 全局设计系统（契约锚、Token 扩展、动效、A11y、Anti-Patterns、技术绑定） |
| 2 | `.sisyphus/runs/2026-04-17-211321/design/wireframes/portal-home.md` | 微门户首页线框图 |
| 3 | `.sisyphus/runs/2026-04-17-211321/design/wireframes/identity-onboarding.md` | 身份认证漏斗线框图 |
| 4 | `.sisyphus/runs/2026-04-17-211321/design/wireframes/alumni-card.md` | 电子校友卡线框图 |
| 5 | `.sisyphus/runs/2026-04-17-211321/design/wireframes/donation-hall.md` | 捐赠大厅线框图 |
| 6 | `.sisyphus/runs/2026-04-17-211321/design/wireframes/workflow-hall.md` | 一站式办事大厅线框图 |
| 7 | `.sisyphus/runs/2026-04-17-211321/design/interaction/portal-home-state.md` | 微门户首页状态机 |
| 8 | `.sisyphus/runs/2026-04-17-211321/design/interaction/identity-onboarding-state.md` | 身份认证状态机 |
| 9 | `.sisyphus/runs/2026-04-17-211321/design/interaction/alumni-card-state.md` | 电子校友卡状态机 |
| 10 | `.sisyphus/runs/2026-04-17-211321/design/interaction/donation-hall-state.md` | 捐赠订单状态机 |
| 11 | `.sisyphus/runs/2026-04-17-211321/design/interaction/workflow-hall-state.md` | 办事预约状态机 |
| 12 | `.sisyphus/runs/2026-04-17-211321/design/page-overrides.md` | 5 页 Override 规则集 |
| 13 | `.sisyphus/runs/2026-04-17-211321/design/P3-delivery-index.md` | 本总览 |

既有参考（P3 未修改）：
- `docs/ui/design-system.md`（契约锚）
- `docs/ui/page-map.md`
- `docs/ui/wireframes/{activity-engine,data-dashboard,enterprise-platform}.md`
- `docs/ui/interaction/{activity-engine,data-dashboard,enterprise-platform}-state.md`
- `design-system/baiyunu-alumni-platform/MASTER.md`（PROMPT.md 原始产物，已显式驳回）

## 2. 与 P2 架构蓝图的映射

| P3 文档 | 对应 P2 服务 | 关键 API 族 | 组件契约 |
|---------|-------------|------------|---------|
| `portal-home.md` | `portal-cms-service` | `/api/v1/public/portal/*` | `PortalBanner` `PortalKingKong` `PortalNewsFeed` |
| `identity-onboarding.md` | `identity-service` | `/api/v1/alumni/certifications` + `/api/v1/public/edu/*` | `AlumniIdentityForm` `StepProgressBar` `CascaderSelect` `EduSystemAdapter`（P2 §5） |
| `alumni-card.md` | `identity-service` + `notification-service` | `/api/v1/alumni/campus-card/*` + `ws /cert` | `E-CampusCard` `CardFlipWrapper` `MarqueeWatermark` `GateAdapter` |
| `donation-hall.md` | `donation-service` | `/api/v1/alumni/donations` + `/api/v1/webhook/payment` | `DonationCheckout` `EmotionalAmountPicker` `DonationCertificatePreview` `PaymentAdapter` |
| `workflow-hall.md` | `workflow-service` | `/api/v1/alumni/appointments/*` + `/api/v1/alumni/companions` | `AppointmentCalendar` `CompanionListForm` `WorkflowProgressTimeline` `GateAdapter` |
| `page-overrides.md` | 全服务 | — | Token 级覆盖 |
| 5 份状态机 | 对应领域服务 | 前端 state ↔ 后端 `status` | — |

本 P3 未引入新的领域服务或数据表；全部 API 均可在 P2 Phase 1a 既有领域切片下实现。

## 3. P4 路线建议（Phase 1a 任务包增补）

建议在 P2 Phase 1a 任务包基础上**追加**以下任务条目（不替换既有包）：

1. **P1a-UI-Tokens-Extend**：在 `packages/ui` 扩展 3 个语义 Token（`color-honor-gold` / `color-emotion-red` / `color-data-accent`），同步 `tailwind.config.js` 与 CSS Variables；附 Storybook 视觉快照。
2. **P1a-UI-Fonts-Subset**：配置 `Noto Serif SC` 子集化打包（仅加载证书/卡片 CJK 子集，WOFF2 ≤ 180KB），提供 `font-display: swap` 与系统宋体回落。
3. **P1a-UI-Motion-Config**：全局 `MotionConfig reducedMotion="user"`，封装 5 个动效 Token 为 hook（`useQrRotate` / `useDonorMarquee` / `useStepProgress` / `useDataPulse` / `useCanvasSnap`）。
4. **P1a-UI-Components-New**：按各 wireframe 新增组件 API 草案落地为 `packages/ui` 组件（约 18 个），每个组件配 Storybook story + 基础可访问性测试。
5. **P1a-Telemetry-Dict**：埋点字典落地为 `packages/telemetry`，含 5 份 wireframe 文档所列 30+ 个 `event_name` 的 JSON Schema 校验。
6. **P1a-A11y-Baseline**：引入 `jest-axe` + `@axe-core/playwright`，对 5 个 wireframe 对应页面跑基线扫描，违规项回溯 MASTER §5。
7. **P1a-Overrides-Applier**：将 `page-overrides.md` 的 5 组规则转化为 ESLint 自定义规则（禁用 `bg-white/10`）+ 组件级 `variant` 参数，避免业务层遗忘 Override。

Phase 1a 任务包完工判定条件：13 份 P3 文档中声明的全部组件 API 具备 Storybook 展示 + 一次完整 e2e 走查通过。

## 4. 风险与未决项

| 风险 | 等级 | 缓解 |
|------|------|------|
| `Noto Serif SC` 字体授权 | 低 | Google Fonts 下 SIL OFL 开源授权，商用免费；子集化发布至自有 CDN 避免跨境访问问题 |
| 小程序端 `onUserCaptureScreen` iOS 漏报 | 中 | 以 30s 定时 QR 刷新作为兜底，水印恒显 |
| 支付 Webhook 丢失 | 中 | 120s 主动查询 + 10 分钟长轮询 + 人工客服兜底 |
| 大屏投影模式多端时钟不同步 | 低 | 服务端下发 `server_time`，前端每 60s 校时 |
| `color-honor-gold` on 白底对比度仅 2.9:1 | 中 | 仅作为图形/徽章描边，正文文本强制回 `color-text-primary`；MASTER §1.3 已明文约束 |
| 老年校友对 5 步漏斗疲劳 | 中 | 单焦点布局 + 草稿自动保存 + 人工申诉绿色通道 |
| 捐赠情怀面值脉冲触发动效告警 | 低 | 限循环 5 次后停止；`prefers-reduced-motion` 下降级 |
| 扩展 Token 多端一致性 | 低 | 由 `packages/ui` 单源输出，Taro 4 + Vite 共用同一份 Token |

未决项需在 P4 启动会上确认：
1. 电子校友卡"导出 PDF 履历"是否进入 M1 范围（当前 wireframe 已预留入口，后端接口可延至 M1.5 兑现）。
2. 捐赠退款前端展示是否在 M1 暴露给校友端（当前仅客服后台操作）。
3. 办事大厅"档案查询"数据源接入路径（走 `EduSystemAdapter` 还是新 Adapter）。

## 5. 完成自检

- [x] 13 份 Markdown 文档全部生成
- [x] 未修改 `docs/` 下任何既有文件
- [x] 未覆盖 `design-system/baiyunu-alumni-platform/MASTER.md`
- [x] 未引入 emoji 作 UI 图标
- [x] 未替换既有 Primitive Token 值
- [x] 未使用 `docker` / `SSR` / `pgvector` / `LLM`（M1 排除术语）
- [x] Token 命名与 `docs/ui/design-system.md` 一致
- [x] ASCII 线框图等宽字符、宽度 ≤ 80 列
- [x] 每份 wireframe ≥ 3 个埋点事件
- [x] 每份 state machine ≥ 1 条异常路径 + `stateDiagram-v2`
