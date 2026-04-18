# P0 分流决策记录

- **任务名**: baiyunu-alumni-platform
- **日期**: 2026-04-17
- **Run ID**: 2026-04-17-211321

## 任务交付物（摘自 docs/prd.md）

v1.0 MVP 交付范围：
1. 前后双端统一门户建站生成与运营工具（FR-001）
2. 数据 ETL 融合去重 + 大数据看板（FR-003 / FR-010）
3. 严格注册漏斗 + 电子校友卡发放（FR-004）
4. 树状多层校友总分会 + AI 发单助手（FR-005）
5. 泛活动云管家 + 签到投票引擎（FR-006）
6. 实物/现金捐赠引擎 + 电子证书（FR-009）
7. 招聘/预约办证/查档微办大厅 + AI 聊机器人（FR-002 / FR-007 / FR-008）

## 选定模式

- **模式**: fullstack+design
- **管线**: P0 → P1 → P2 → P3 → P4 → P5 → P6A → P6B → P7 → P8
- **理由**: 从 0 到 1 构建全栈系统，覆盖前端（PC + 小程序）、后端微服务、数据库 ETL、UI 设计。docs/ui 中已有初步设计文档（page-map / wireframes / design-system），P3 需在既有基础上细化风格定稿（将参考 .github/prompts/ui-ux-pro-max）。

## 跳过的 Phase

无。fullstack+design 全管线执行。

## 移交包检测

`.sisyphus/handoff/plan-to-enterprise.md` 不存在。从 P1 开始。

## 前置材料

- `docs/prd.md` — 产品需求主档
- `docs/stories/` — 8 个 Epic 分解文档
- `docs/ui/page-map.md`、`docs/ui/design-system.md`、`docs/ui/wireframes/`、`docs/ui/interaction/`
- `docs/changelog.md` — 版本历史
- `downloaded_images/` — 建设方案原始截图（NF-001 约束：代码中不直接引用，仅作参考）
