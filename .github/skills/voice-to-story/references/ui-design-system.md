# Phase 12: 设计系统规范协议

## 适用场景

将线框图和状态机规范转化为**设计 Token + 组件体系**，覆盖视觉语言、响应式规则、组件 API、开发交接清单。

目标：让开发团队无需询问就能实现与设计一致的界面。

---

## 输入要求

- `docs/ui/wireframes/*.md` — 页面线框图
- `docs/ui/interaction/*.md` — 状态机规范（组件状态）
- 产品方向/品牌定义（来自 PRD 或用户提供的方向）

---

## Step 1: 视觉基调确定

执行前先明确这些问题。若未提供，从 PRD 目标用户 + 业务背景推断，并标注为"推断值，待确认"：

```markdown
## 视觉基调

**产品类型**: {工具类 / 平台类 / 内容类 / 交易类}
**目标用户群**: {年龄段、技术水平、使用场景}
**品牌情绪词**: {3-5 个词，如：专业、高效、亲切、可信赖、年轻}
**风格方向**: {minimal / functional / warm / bold / ...}

**设计决策**:
- 使用色：{主色 HEX + 语义}
- 字型选择：{标题字体 / 正文字体（必须说明为何选择）}
- 圆角级别：{sharp / soft / round}
- 阴影使用：{flat / subtle / expressive}
- 图标风格：{line / filled / duo-tone}
```

---

## Step 2: Design Token 体系

### 颜色 Token

```markdown
## 颜色系统

### 基础色板（Primitive Tokens）
不直接使用，只作为语义 Token 的值来源：
- `color-blue-50` → #EFF6FF
- `color-blue-500` → #3B82F6
- `color-blue-700` → #1D4ED8
- ...（以实际主色为基准，扩展 9 个色阶）

### 语义 Token（Surface + Text + Border + State）

| Token | 亮色值 | 暗色值 | 用途 |
|-------|--------|--------|------|
| `color-bg-primary` | #FFFFFF | #0F172A | 页面主背景 |
| `color-bg-secondary` | #F8FAFC | #1E293B | 区域/卡片背景 |
| `color-bg-elevated` | #FFFFFF | #334155 | 悬浮元素（弹窗/下拉） |
| `color-text-primary` | #0F172A | #F1F5F9 | 主文字 |
| `color-text-secondary` | #475569 | #94A3B8 | 辅助文字 |
| `color-text-disabled` | #CBD5E1 | #475569 | 禁用文字 |
| `color-border-default` | #E2E8F0 | #334155 | 默认边框 |
| `color-border-strong` | #94A3B8 | #64748B | 强调边框 |
| `color-accent` | #3B82F6 | #60A5FA | 品牌强调色 |
| `color-danger` | #EF4444 | #F87171 | 危险/错误 |
| `color-success` | #22C55E | #4ADE80 | 成功状态 |
| `color-warning` | #F59E0B | #FBBF24 | 警告状态 |
| `color-info` | #3B82F6 | #60A5FA | 信息提示 |
```

### 间距 Token

```markdown
## 间距系统（8px 基准）

| Token | 值 | 用途 |
|-------|----|------|
| `space-1` | 4px | 极小间距（内部元素紧凑排列） |
| `space-2` | 8px | 小间距（图标与文字、行间距） |
| `space-3` | 12px | 中小间距（列表项内间距） |
| `space-4` | 16px | 基本间距（内容区 padding） |
| `space-6` | 24px | 中间距（区域分隔） |
| `space-8` | 32px | 大间距（节区间隔） |
| `space-12` | 48px | 超大间距（页头/页尾） |

页面内边距：Mobile `space-4`，Tablet `space-6`，Desktop `space-8`
```

### 字体 Token

```markdown
## 字体系统

**字体栈**:
- 标题: `{标题字体}, system-ui, sans-serif`
- 正文: `{正文字体}, system-ui, sans-serif`
- 代码: `{等宽字体}, monospace`

| Token | 字号 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `text-xs` | 12px | 16px | 400 | 辅助信息、标签 |
| `text-sm` | 14px | 20px | 400 | 次要正文、注释 |
| `text-base` | 16px | 24px | 400 | 主体正文 |
| `text-lg` | 18px | 28px | 500 | 强调文字 |
| `text-xl` | 20px | 28px | 600 | 小标题 |
| `text-2xl` | 24px | 32px | 600 | 页面标题（Mobile） |
| `text-3xl` | 30px | 36px | 700 | 大标题（Desktop） |
| `text-4xl` | 36px | 40px | 700 | Hero 标题 |
```

### 圆角 + 阴影 Token

```markdown
## 形状系统

| Token | 值 | 用途 |
|-------|----|------|
| `radius-sm` | 4px | 小组件（标签、徽章） |
| `radius-md` | 8px | 卡片、输入框 |
| `radius-lg` | 12px | 大卡片、模态框 |
| `radius-xl` | 16px | 底部弹出框 |
| `radius-full` | 9999px | 圆形按钮、头像 |

| Token | 值 | 用途 |
|-------|----|------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,.05) | 微浮起 |
| `shadow-md` | 0 4px 6px rgba(0,0,0,.07) | 卡片 |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,.1) | 弹出框、下拉菜单 |
| `shadow-xl` | 0 20px 25px rgba(0,0,0,.15) | 模态框 |
```

---

## Step 3: 断点系统

```markdown
## 响应式断点

| 名称 | 最小宽度 | 布局变化 |
|------|---------|---------|
| `mobile` | 0px | 单列，底部导航 |
| `tablet` | 768px | 两列，侧边栏可见 |
| `desktop` | 1024px | 三列/宽内容区，顶部导航 |
| `wide` | 1280px | 内容区最大宽度限制（1200px） |

**响应式原则**:
- 以 mobile 为基础样式
- 仅在布局真正断裂时增加 breakpoint
- 不允许 `width: 50%` 这种不带 breakpoint 的隐式响应
```

---

## Step 4: 组件体系

### 原子组件（Atoms）

```markdown
## 原子组件清单

| 组件 | 变体 | 状态 | Token 依赖 |
|------|------|------|-----------|
| `Button` | primary/secondary/ghost/danger | default/hover/active/disabled/loading | color-accent, radius-md |
| `Input` | text/number/password/search | default/focus/error/disabled/readonly | color-border, radius-md |
| `Badge` | default/success/warning/danger/info | — | color-{semantic} |
| `Avatar` | sm(32)/md(40)/lg(48)/xl(64) | default/loading | radius-full |
| `Icon` | 按图标名 | default/muted/accent | color-text |
| `Spinner` | sm/md/lg | — | color-accent |
| `Divider` | horizontal/vertical | — | color-border |
| `Tag` | default/removable | default/active/disabled | color-bg-secondary |
```

### 分子组件（Molecules）

```markdown
## 分子组件清单

| 组件 | 子组件构成 | 变体 | 关键 Props |
|------|----------|------|-----------|
| `ListItem` | Avatar + 文字 + 次要信息 + 动作 | compact/default/expanded | `title, subtitle, meta, action, onTap` |
| `SearchBar` | Input + Icon + ClearButton | default/active/loading | `value, onSearch, onClear, placeholder` |
| `FormField` | label + Input/Select + ErrorMessage | default/focused/error/disabled | `label, required, error, hint` |
| `Card` | 容器 + 内容插槽 | flat/elevated/bordered | `title, onTap, elevation` |
| `EmptyState` | 插图 + 标题 + 说明 + 操作 | — | `icon, title, description, action` |
| `ErrorState` | 图标 + 标题 + 说明 + 重试 | — | `title, description, onRetry` |
| `SkeletonLoader` | 占位区块 | list/card/text | `count, type` |
| `Toast` | 图标 + 消息 + 关闭 | success/error/warning/info | `message, duration, onClose` |
| `BottomNavBar` | NavItem * N | — | `items[{icon, label, path}], activePath` |
```

### 有机组件（Organisms）

```markdown
## 有机组件清单

| 组件 | 职责 | 关键状态 | 所在页面 |
|------|------|---------|---------|
| `WorkerList` | 工人列表，含搜索筛选 | idle/loading/success/empty/error | 首页/搜索 |
| `OrderCard` | 单笔订单信息展示 | pending/active/completed/cancelled | 我的订单 |
| `PublishForm` | 多步骤发布需求表单 | step1-N/submitting/success/error | 发布需求 |
| `ProfileHeader` | 个人主页头部信息 | — | 个人主页 |
| `ReviewList` | 评价列表（可分页） | loading/success/empty | 工人详情 |
```

---

## Step 5: 组件 API 规格

每个核心有机组件输出详细 API：

```markdown
## 组件 API: WorkerList

### Props
| Prop | 类型 | 必须 | 默认值 | 说明 |
|------|------|------|--------|------|
| `initialQuery` | `string` | ❌ | `""` | 初始搜索词 |
| `filters` | `FilterConfig` | ❌ | `{}` | 初始筛选条件 |
| `onItemPress` | `(id: string) => void` | ✅ | — | 点击列表项 |
| `pageSize` | `number` | ❌ | `20` | 每页条数 |

### 内部状态
参见 `docs/ui/interaction/worker-list-state.md`

### Events Emitted（不使用 callback 时）
- `item-selected` → `{ workerId: string }`
- `filter-changed` → `{ filters: FilterConfig }`

### 示例用法
（代码片段，与具体框架无关的伪代码）
```

---

## Step 6: 可访问性（Accessibility）规格

```markdown
## 可访问性要求

**最低标准**: WCAG 2.1 AA

| 规则 | 具体要求 |
|------|---------|
| 颜色对比 | 正文文字 ≥ 4.5:1，大字标题 ≥ 3:1 |
| 触控热区 | 所有可交互元素 ≥ 44×44px （Mobile） |
| 焦点样式 | 所有可聚焦元素有清晰可见的 focus 状态 |
| 图标按钮 | 必须有 `aria-label` 或 visually hidden 文字 |
| 表单字段 | 必须有关联 `label`，错误信息使用 `aria-describedby` |
| Loading 状态 | 使用 `aria-busy` 或 `aria-live` region 通知屏幕阅读器 |
| 状态变化 | 重要状态变更使用 `role="alert"` 或 `aria-live="polite"` |
| 色盲友好 | 不仅依赖颜色传递信息（同时使用图标/文字/形状） |
```

---

## 产出清单

产出到 `docs/ui/design-system.md`：

```markdown
# 设计系统规范

**生成日期**: {date}
**基于产品**: {product_name} v{version}

## 0. 视觉基调
## 1. 颜色 Token
## 2. 间距 Token
## 3. 字体 Token
## 4. 形状 Token（圆角 + 阴影）
## 5. 断点系统
## 6. 组件体系概览
   ### 6.1 原子组件
   ### 6.2 分子组件
   ### 6.3 有机组件
## 7. 核心组件 API
## 8. 可访问性规格

---

## 开发交接清单

- [ ] 所有 Token 已定义（CSS Variables / Tailwind config / Style Dictionary）
- [ ] 所有原子组件变体和状态已覆盖
- [ ] 有机组件 API Prop 类型已定义
- [ ] 每个状态有对应的视觉规格
- [ ] 可访问性要求已列入验收条件
```

---

## 禁止事项

- 不使用魔法值（颜色、间距全部 Token 化）
- 不定义超过 3 层嵌套的组件（拆分为独立组件）
- 不忽略移动端触控热区要求（≥ 44px）
- 不用颜色作为唯一区分方式（须配合形状/图标/文字）
- 不在设计系统中定义与业务逻辑耦合的样式
