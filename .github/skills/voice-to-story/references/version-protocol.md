# Phase 7: 版本管理协议

## 适用场景

管理需求文档的版本生命周期：锁定版本、创建快照、增量更新路由。

---

## 状态机

```
  draft ──── "敲定" ────→ locked ──── 新内容到达 ────→ draft (bumped)
    ↑                        │
    │                        │ 手动归档
    │                        ▼
    └──────────────────── archived
```

三种状态：

| 状态 | 含义 | 允许的操作 |
|------|------|-----------|
| `draft` | 活跃迭代中，可自由修改 | Phase 1-3 正常处理、编辑 PRD/stories |
| `locked` | 版本已锁定，不可修改 | 只能：(1) 创建勘误 patch (2) bump 到新 draft |
| `archived` | 历史版本，仅供查阅 | 无操作 |

---

## 状态文件

版本状态存储在 `docs/.version`（YAML 格式），是**唯一权威来源**。

```yaml
current_version: "0.4"
status: draft          # draft | locked | archived
locked_versions:
  - version: "0.3"
    locked_at: "2026-03-28"
    snapshot: "archive/v0.3/"
scope:
  - docs/prd.md
  - docs/stories/**
  - docs/changelog.md
last_updated: "2026-03-31"
```

**Fallback 规则**：`.version` 文件不存在或损坏时，默认当作 `draft` 处理并重建文件。

---

## 操作 1: 锁定版本（draft → locked）

### 触发词

用户说出以下任意关键词且意图为锁定（非否定语境）：
- "敲定了"、"定版"、"定稿"、"锁版"
- "就这个为第 N 版"、"发布第 N 版"
- "确定版本"、"freeze"

**误触防护**：以下不触发锁定：
- "第一版不做 XX"（否定语境）
- "第一版的 XX 需要改"（修改语境）
- "先不敲定"（显式否定）

判断方法：检查关键词前后 10 字是否有否定词（"不"、"先不"、"别"、"暂时"、"还没"）。

### Pre-lock 验证（必须执行）

锁定前扫描所有 scope 内文件：

1. **TBD 扫描**：搜索 `TBD`、`待确认`、`⚠️` 标记
2. **开放问题扫描**：检查 PRD §13 中阻塞等级为 🔴 的条目
3. **Draft 故事扫描**：检查 stories/ 中状态为 `Draft` 的故事

**有未解决项时**：

```
⚠️ 版本锁定前检查发现以下未解决项：

### TBD / 待确认项 ({N} 项)
1. [FR-032] 商家端搜索/筛选字段列表待确认
2. [§4] 业务目标 / OKR 连接标注 TBD
...

### 阻塞级开放问题 ({N} 项)
1. [Q-001] ...

### Draft 状态用户故事 ({N} 个)
1. [US-015] ...

选择：
(A) 带着未解决项锁定（标注为"已知遗留"）
(B) 先解决再锁定
```

用户选 A → 在 MANIFEST 中记录已知遗留项。
用户选 B → 保持 draft，不执行锁定。

### 锁定执行步骤

1. **读取 `.version`**，确认当前 `status: draft`
2. **版本号确认**：
   - 用户指定了目标版本号（如"就这个为第一版" → 1.0，"发布 v2.0" → 2.0）→ 先 bump `current_version` 到目标版本号
   - 用户未指定版本号（如"敲定了"、"锁版吧"）→ 使用当前 `current_version`，不 bump
3. **执行 Pre-lock 验证**
4. **用户确认后**，创建快照：
   ```
   docs/archive/v{X.Y}/
   ├── MANIFEST.md          (版本摘要)
   ├── prd.md               (PRD 快照副本)
   └── stories/             (所有 Epic 文件副本)
   ```
5. **生成 MANIFEST.md**：
   ```markdown
   # v{X.Y} 版本快照

   - **锁定日期**：{YYYY-MM-DD}
   - **锁定人**：{触发锁定的用户指令}
   - **PRD 版本**：v{X.Y}
   - **包含 Epic**：{列表}
   - **用户故事总数**：{N}
   - **已知遗留**：{列表或"无"}

   ## Changelog 摘要
   {从 docs/changelog.md 提取本版本的变更条目}
   ```
6. **更新 `.version`**：
   ```yaml
   current_version: "{X.Y}"
   status: locked
   locked_versions:
     - version: "{X.Y}"
       locked_at: "{YYYY-MM-DD}"
       snapshot: "archive/v{X.Y}/"
     # 保留之前的 locked_versions
   ```
7. **更新 `docs/changelog.md`**：追加版本锁定条目
8. **输出确认**：
   ```
   ✅ v{X.Y} 已锁定

   快照：docs/archive/v{X.Y}/
   包含：{N} 条功能需求、{M} 个用户故事
   已知遗留：{N} 项 / 无
   ```

---

## 操作 2: 新内容到达时的版本路由

当 Skill 的 Phase 0 检测到 `.version` 状态时：

### status: draft
→ 正常执行 Phase 1-3。无额外操作。

### status: locked
→ 新内容不能直接写入已锁定版本。提示用户：

```
当前版本 v{X.Y} 已锁定。新内容需要选择去向：

(A) 创建新版本 v{X.Y+0.1}（基于当前版本 + 新内容）
(B) 创建勘误补丁 v{X.Y}.1（仅修正已锁定版本的错误）
(C) 取消处理
```

- 用户选 **A**：
  1. bump `current_version` 到 `{X.Y+0.1}`
  2. `status` 改回 `draft`
  3. 正常执行 Phase 1-3
  
- 用户选 **B**：
  1. 在 `archive/v{X.Y}/` 下创建 `errata/` 子目录
  2. 记录勘误内容
  3. `current_version` 不变，`.version` 中记录 `errata_count: N`
  
- 用户选 **C**：
  1. 不做任何处理

### status: archived
→ 不允许操作，提示用户创建新版本。

---

## 操作 3: 手动 bump 新版本

用户说 "开始第 N 版" / "新版本" / "升级版本" 时：

1. 确认当前状态
2. 如果 `locked` → 直接 bump
3. 如果 `draft` → 提示"当前版本未锁定，是否先锁定再开始新版本？"
4. bump 逻辑：
   - 主版本号 +1（如 0.4 → 1.0 用于第一次正式发布）
   - 或按用户指定的版本号
5. `.version` 更新为新版本 + `status: draft`
6. 旧版本的 `locked_versions` 条目状态改为 `archived`

---

## 版本号规则

| 场景 | 版本号变化 | 示例 |
|------|-----------|------|
| 新增交流内容（draft 中） | minor +0.1 | 0.3 → 0.4 |
| 用户说"敲定" | 不变，状态改 locked | 0.4 (draft → locked) |
| 锁定后新内容到达 | minor +0.1 | 0.4 → 0.5 |
| 用户说"第一版" | 升为 1.0 | 0.5 → 1.0 |
| 第一版锁定后新内容 | 1.0 → 1.1 (draft) | 继续迭代 |
| 用户说"第二版" | 升为 2.0 | 1.3 → 2.0 |
| 勘误（已锁定版本修正） | patch +.1 | 1.0 → 1.0.1 |

---

## 快照内容规则

### 纳入快照的文件
- `docs/prd.md` — PRD 全文
- `docs/stories/` — 所有 Epic 文件
- `docs/changelog.md` — 变更日志

### 不纳入快照的文件
- `docs/meetings/` — 会议纪要是时间线记录，不随版本变
- `docs/sprint/` — Sprint 计划是执行层面的，独立于版本
- `docs/wwas/` — WWAS 同上

### 快照存储位置

```
docs/
├── archive/
│   ├── v0.3/
│   │   ├── MANIFEST.md
│   │   ├── prd.md
│   │   └── stories/
│   │       ├── epic-01-用户与商家注册.md
│   │       └── ...
│   └── v0.4/
│       └── ...
├── meetings/          (不进 archive)
├── stories/           (活跃版本)
├── prd.md             (活跃版本)
├── changelog.md
└── .version
```

---

## 禁止事项

- 不修改已锁定版本的 archive 文件（勘误除外）
- 不在 locked 状态下直接执行 Phase 1-3 写入
- 不跳过 Pre-lock 验证
- 不在两个地方维护版本状态（`.version` 是唯一源）
- 不删除 archive 中的历史版本（即使有更新版本）
