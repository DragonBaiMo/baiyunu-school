---
name: voice-to-story
description: >
  把语音交流转写稿转化为结构化会议纪要、产品需求文档(PRD)和用户故事，并管理需求文档版本生命周期；
  同时支持将 PRD/用户故事进一步转化为 UI 设计资产（页面架构、线框图、交互状态机、设计系统）。
  适用于：(1) 处理一段新的语音交流/会议录音转写 (2) 基于新交流更新已有 PRD 和用户故事
  (3) 从多轮语音交流中累积构建完整的产品需求体系 (4) 锁定版本/定版/发布版本
  (5) 规划 Sprint (6) 生成 WWAS Backlog 条目
  (7) 生成 UI 页面架构 (8) 生成线框图 (9) 生成交互状态机规范 (10) 生成设计系统。
  触发词："处理语音"、"处理会议记录"、"更新需求"、"语音转需求"、"voice to story"、
  "整理会议"、"提取用户故事"、"规划 Sprint"、"生成 Backlog 条目"、"生成 WWAS"、
  "敲定"、"定版"、"定稿"、"锁版"、"第N版"、"发布版本"、
  "生成 UI"、"页面规划"、"画线框"、"做线框图"、"UI 规格"、"状态机"、"交互规范"、"设计系统"。
  不适用于：音频转文字（ASR）、纯代码实现、非产品需求类会议。
---

# Voice to Story

把语音交流转写稿变成可执行的产品需求资产：会议纪要 → PRD → 用户故事。

## 触发条件

当用户提供语音交流/会议的转写文本，并希望从中提取产品需求时直接执行。

输入形式：
- 粘贴的转写文本
- `.md` / `.txt` 文件路径
- 文件夹路径（批量处理多份转写）

## 固定变量

```
工作目录   = {project_root}/docs/
版本状态   = {project_root}/docs/.version
会议纪要   = {project_root}/docs/meetings/
PRD 文件   = {project_root}/docs/prd.md
用户故事   = {project_root}/docs/stories/
版本快照   = {project_root}/docs/archive/
变更日志   = {project_root}/docs/changelog.md
转写来源   = {project_root}/talking/（默认，可由用户指定）
UI 设计    = {project_root}/docs/ui/
页面架构   = {project_root}/docs/ui/page-map.md
线框图目录 = {project_root}/docs/ui/wireframes/
交互规范   = {project_root}/docs/ui/interaction/
设计系统   = {project_root}/docs/ui/design-system.md
```

## 主流程（13 个 Phase，Phase 1-3 默认执行，Phase 4-5/7-12 按需触发）

### Phase 0: 环境准备 + 版本状态检查

1. 检查 `docs/` 目录是否存在，不存在则创建完整目录结构：
   ```
   docs/
   ├── .version         (版本状态追踪，不存在时创建默认 draft)
   ├── meetings/
   ├── stories/
   ├── archive/         (版本快照目录)
   ├── prd.md           (不存在时在 Phase 2 创建)
   └── changelog.md     (不存在时创建空模板)
   ```
2. **版本状态检查**（读取 `docs/.version`）：
   - `.version` 不存在 → 创建默认文件（`status: draft`），继续
   - `status: draft` → 正常继续 Phase 1-3
   - `status: locked` → **暂停**，提示用户选择：
     - (A) 创建新版本（bump minor，回到 draft，继续处理）
     - (B) 创建勘误补丁（修正已锁定版本的错误）
     - (C) 取消处理
   - 用户选 A → 更新 `.version`（bump version, status→draft），继续
   - 用户选 B → 在 `archive/v{X.Y}/errata/` 下记录勘误
   - 用户选 C → 终止流程
3. 检查是否已有 `docs/prd.md` → 决定 Phase 2 走"新建"还是"增量更新"路径
4. 读取用户提供的转写文本

### Phase 1: 会议结构化 → 读取 references/meeting-digest.md

**输入**：原始转写文本（含发言人标签的中文对话）

**执行**：按 `references/meeting-digest.md` 中的完整协议处理。

**关键提取目标**（7 类）：

| 类别 | 识别信号 | 标注要求 |
|------|---------|---------|
| 关键决策 | "就这样"、"确定了"、"那就"、"好的"后接结论 | 标注决策内容 + 决策方 |
| 行动项 | 姓名+动词、"你负责"、"我来搞"、"下周前" | 标注负责人 + 截止日期 + 直接/推断 |
| 需求信号 | 功能描述、用户操作流程、界面要求、支付流程 | 标注为新增/修改/待确认 |
| 开放问题 | "还不确定"、"后面再说"、"需要再看"、"不知道" | 标注阻塞等级 |
| 技术约束 | 加密、托管、API、第三方费用 | 标注约束类型 |
| 范围边界 | "第一版不做"、"先不用"、"后面再说" | 标注 in/out of scope |
| **范围重定义 (SCOPE_RESET)** | 文件名含"重构/改版"；"前面的都不做了"；"功能少无所谓"；"只做 X"且远少于现有 PRD | 标注 true/false/possible |

**产出**：`docs/meetings/{YYYY-MM-DD}-{主题摘要}.md`

**质量门控**：产出必须有 ≥1 条决策或行动项。全是闲聊无可操作内容时，明确报告"本次交流无可操作需求产出"。

### Phase 1.5: SCOPE_RESET 检查（在 Phase 2 前强制执行）

读取 Phase 1 产出的会议纪要，检查 frontmatter 中的 `scope_reset` 字段：

- `scope_reset: false` → 直接进入 Phase 2（正常增量更新）
- `scope_reset: possible` → 提示用户：
  ```
  ⚠️ 本次会议可能包含范围重定义信号（不确定）。

  若继续增量更新 PRD，可能在现有文档中加入冲突内容。
  建议选择：
  (A) 增量更新（在现有 PRD 基础上追加/修改）
  (B) 暂停 — 先人工确认范围再处理
  ```
- `scope_reset: true` → **强制暂停**，提示用户：
  ```
  🔄 范围重定义事件检测到

  本次会议包含明确的范围重定义信号（见会议纪要"🔄 范围重定义事件"节）。
  当前 PRD（{version}，{status}）可能包含大量不再适用的内容。

  建议操作：
  (A) 归档当前版本 → 基于本次会议的"保留范围"重建精简 PRD【推荐】
      → 执行：Phase 7（版本锁定快照）→ Phase 2（重建模式）
  (B) 继续增量追加（在旧 PRD 基础上叠加，不归档）
  (C) 仅保存会议纪要，暂不更新 PRD
  ```
  - 用户选 A → 先执行 Phase 7，然后进入 Phase 2 的"范围重建"路径
  - 用户选 B → 直接进入 Phase 2 增量更新路径
  - 用户选 C → 终止，仅输出会议纪要

### Phase 2: PRD 更新 → 读取 references/prd-protocol.md

**输入**：Phase 1 产出的会议纪要

**执行**：按 `references/prd-protocol.md` 中的完整协议处理。

**路径判断**：
- `docs/prd.md` **不存在** → 走"全新 PRD 生成"流程
- `docs/prd.md` **已存在** → 走"增量更新"流程，先输出变更差异等用户确认

**核心原则**：
- PRD 是活文档，每次语音交流后更新
- 所有更新在 `docs/changelog.md` 记录
- 已存在的 PRD 不直接覆盖，先展示 ADDED / MODIFIED / REMOVED 差异

**产出**：`docs/prd.md`（新建或更新）+ `docs/changelog.md` 追加条目

### Phase 3: 用户故事生成 → 读取 references/story-protocol.md

**输入**：Phase 2 产出的 PRD（最新版）

**执行**：按 `references/story-protocol.md` 中的完整协议处理。

**路径判断**：
- 首次 → 从 PRD 全量生成故事集
- 非首次 → 仅对 Phase 2 中 ADDED / MODIFIED 的需求生成或更新故事

**核心原则**：
- 每个故事符合 INVEST 标准
- 验收标准用 Given-When-Then 格式
- 大故事自动拆分（>5 天工作量）
- 按 Epic 分组，每个 Epic 一个 `.md` 文件

**产出**：`docs/stories/{epic-name}.md`（一个或多个文件）

### Phase 4: Sprint 规划（可选）→ 读取 references/sprint-plan.md

**触发**：用户明确要求"规划 Sprint"或"生成 Sprint 计划"时执行；默认流程中跳过。

**输入**：Phase 3 产出的 docs/stories/（所有 Epic 文件）

**执行**：按 `references/sprint-plan.md` 中的完整协议处理。

**产出**：`docs/sprint/sprint-01.md`（及后续 sprint-NN.md）

### Phase 5: WWAS Backlog 条目（可选）→ 读取 references/wwas.md

**触发**：用户明确要求"生成 WWAS"、"生成 Backlog 条目"、"工程交付物"时执行；默认流程中跳过。

**输入**：Phase 2 产出的 docs/prd.md（战略背景） + Phase 3 产出的 docs/stories/

**执行**：按 `references/wwas.md` 中的完整协议处理。

**产出**：`docs/wwas/epic-NN-wwas.md`（按 Epic 分组）

### Phase 6: 完成报告

执行完本次触发的所有 Phase 后，输出简要报告：

```
## 本次更新摘要

**处理的转写文件**: {文件名}
**会议纪要**: docs/meetings/{filename}.md

### 关键变更
- 新增需求: {N} 条
- 修改需求: {N} 条
- 新增用户故事: {N} 个
- 更新用户故事: {N} 个
- 开放问题: {N} 个（需后续确认）

### 待确认事项
1. {具体待确认内容}
```

### Phase 7: 版本锁定 → 读取 references/version-protocol.md

**触发**：用户明确要求"敲定"、"定版"、"第一版"、"锁版"、"freeze"时执行；默认流程中跳过。

**输入**：`docs/.version`（当前状态） + `docs/prd.md` + `docs/stories/`

**执行**：按 `references/version-protocol.md` 中的完整协议处理。

**核心步骤**：
1. Pre-lock 验证：扫描 TBD/待确认/阻塞级问题
2. 创建快照到 `docs/archive/v{X.Y}/`
3. 更新 `.version` 状态为 locked
4. 追加 `docs/changelog.md` 版本锁定条目

**产出**：`docs/archive/v{X.Y}/`（含 MANIFEST.md + PRD 快照 + stories 快照）
### Phase 8: UI 参考源分析（可选）→ 读取 references/ui-reference-analysis.md

**触发**：用户提供了参考截图、竞品 App 名/URL、参考网页、前端代码仓库，或在对话中提及"照着 XX 做"、"参考 XX"时执行。亦可在计划做 UI 设计（Phase 9-12）前主动执行。

**输入**：参考源（截图/URL/口述描述/代码仓库）+ `docs/prd.md`

**执行**：按 `references/ui-reference-analysis.md` 中的完整协议处理。

**核心产出**：
1. 参考源清单（类型、借鉴层次）
2. 逐源分析（布局/组件/视觉/交互）
3. 综合报告：布局模式推荐 + 组件模式推荐 + 视觉方向建议
4. 参考 → PRD 功能映射表

**产出**：`docs/ui/reference-analysis.md`
### Phase 9: UI 页面架构（可选）→ 读取 references/ui-page-architecture.md

**触发**：用户明确要求"生成 UI"、"页面规划"、"设计页面"、"产品地图"、"UI 规划"时执行；默认流程中跳过。

**输入**：`docs/prd.md` + `docs/stories/`（Phase 2-3 产出）。如果 Phase 8 已执行，`docs/ui/reference-analysis.md` 参考分析包用作辅助输入。

**执行**：按 `references/ui-page-architecture.md` 中的完整协议处理。

**核心产出**：
1. 用户画像 + 核心任务链
2. 角色旅程（Happy Path + Edge Case）
3. 页面清单（P0/P1/P2 分级）
4. User Story Map（Backbone → Steps → Release Slices）
5. Storyboard（6 格叙事场景）
6. 页面关系图（跳转拓扑）

**产出**：`docs/ui/page-map.md`

### Phase 10: Wireframe（可选）→ 读取 references/ui-wireframe.md

**触发**：用户明确要求"线框图"、"画线框"、"布局图"、"做线框"时执行；亦可在 Phase 9 完成后由用户确认直接进入。

**依赖**：Phase 9 必须已执行（`docs/ui/page-map.md` 存在）

**执行**：按 `references/ui-wireframe.md` 中的完整协议处理。

**核心产出**（每个 P0 页面）：
1. 组件清单
2. Mobile (375px) + Tablet (768px) + Desktop (1024px+) 三档 ASCII 线框图
3. 交互注释（每个可交互元素的行为）
4. 数据需求表
5. Loading / Empty / Error / Success 四种状态线框
6. 表单字段状态矩阵（如有表单）

**产出**：`docs/ui/wireframes/{页面名}.md`（每个 P0 页面一个文件）

### Phase 11: 交互与状态机规范（可选）→ 读取 references/ui-state-machine.md

**触发**：用户明确要求"状态机"、"交互规范"、"UX 规格"、"交互设计"时执行；亦可在 Phase 10 完成后由用户确认直接进入。

**依赖**：Phase 10 必须已执行

**执行**：按 `references/ui-state-machine.md` 中的完整协议处理。

**核心产出**（每个页面/核心组件）：
1. 完整状态清单（含 offline/timeout/permission_denied）
2. 事件列表（用户触发 + 系统触发）
3. 状态转换表（当前状态 × 事件 → 下一状态 + 副作用）
4. 副作用规格（API 调用、导航、本地存储）
5. 验证规则表
6. 错误处理规格（错误码 → 用户消息 → 恢复操作）
7. Given/When/Then 验收标准

**产出**：`docs/ui/interaction/{页面名}-state.md`（每个核心页面/组件一个文件）

### Phase 12: 设计系统规范（可选）→ 读取 references/ui-design-system.md

**触发**：用户明确要求"设计系统"、"Design Token"、"组件规范"、"开发交接"时执行。

**依赖**：Phase 9 必须已执行

**执行**：按 `references/ui-design-system.md` 中的完整协议处理。

**核心产出**：
1. 视觉基调定义（品牌情绪、风格方向）
2. 颜色 Token（Primitive + Semantic，含暗色模式）
3. 间距 Token（8px 基准体系）
4. 字体 Token（层级体系）
5. 形状 Token（圆角 + 阴影）
6. 断点系统
7. 组件体系（Atoms / Molecules / Organisms）
8. 核心组件 API 规格
9. 可访问性规格（WCAG 2.1 AA）
10. 开发交接验收清单

**产出**：`docs/ui/design-system.md`

## 批量处理模式

当用户提供文件夹路径（如 `talking/`）时：

1. 按文件名/日期排序所有 `.md` / `.txt` 文件
2. **严格按时间顺序**逐个执行 Phase 1-3
3. 每次迭代基于上一次的 PRD 累积更新
4. 最终输出合并报告

## 失败处理

| 场景 | 处理 |
|------|------|
| 转写文本太短（<50 字） | 报告"内容不足以提取需求" |
| 无发言人标签 | 将全部内容视为单人输入，标注"未识别发言人" |
| 与已有 PRD 严重冲突 | 输出冲突矩阵，暂停等用户确认 |
| 纯技术讨论无需求内容 | 仅输出会议纪要，跳过 Phase 2-3 |

## 禁止事项

- 不编造转写中未出现的需求
- 不删除已有 PRD 中未被本次交流否定的内容
- 不对争议性决策自行选边（标注为"待确认"）
- 不把推断标注为"直接确认"
- 不跳过 Phase 1 直接进 Phase 2

## References 导航

| 文件 | 何时读取 | 内容 |
|------|---------|------|
| `references/meeting-digest.md` | Phase 1 执行时 | 转写文本解析协议、发言人识别、信息提取规则、输出模板 |
| `references/prd-protocol.md` | Phase 2 执行时 | PRD 生成/增量更新协议、13 段式正式结构、变更日志格式、冲突处理 |
| `references/story-protocol.md` | Phase 3 执行时 | 用户故事生成协议、INVEST 验证、Given-When-Then AC、拆分规则 |
| `references/sprint-plan.md` | Phase 4 执行时（可选） | Sprint 规划协议：容量估算、优先级排序、Sprint 切割、风险识别 |
| `references/wwas.md` | Phase 5 执行时（可选） | WWAS Backlog 条目协议：Why-What-AC-Sizing，用户故事转工程交付物 |
| `references/version-protocol.md` | Phase 0 版本检查时 / Phase 7 版本锁定时 | 版本状态机（draft/locked/archived）、Pre-lock 验证、快照创建、版本号规则 |
| `references/ui-reference-analysis.md` | Phase 8 执行时（可选） | 参考源收集、截图/口述/代码分析、综合报告、PRD 映射 |
| `references/ui-page-architecture.md` | Phase 9 执行时（可选） | 页面架构协议：用户旅程、页面清单（P0/P1/P2）、Story Map、Storyboard、页面关系图 |
| `references/ui-wireframe.md` | Phase 10 执行时（可选） | ASCII 线框图协议：三档断点、交互注释、数据需求、Loading/Empty/Error/Success 四状态 |
| `references/ui-state-machine.md` | Phase 11 执行时（可选） | 交互状态机协议：状态清单、事件列表、转换表、副作用、验证规则、错误处理、验收标准 |
| `references/ui-design-system.md` | Phase 12 执行时（可选） | 设计系统协议：Design Token、组件体系（Atoms/Molecules/Organisms）、组件 API、可访问性 |
