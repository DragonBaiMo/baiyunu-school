# 设计系统规范

**生成日期**: 2026-04-15
**基于产品**: 智慧校友服务平台 v1.0

---

## 0. 视觉基调

**产品类型**: 平台类 / 工具类
**目标用户群**: 全年龄段校友、各级系统管理员、校友企业人员（具备基础到中等技术操作能力，覆盖移动端高频使用场景与PC后台）
**品牌情绪词**: 亲切、可信赖、荣誉感、专业、科技感
**风格方向**: functional & warm (功能导向且传递母校人文关怀)

**设计决策**:
- **使用色**: 深邃海军蓝 `#00375D` (白云学院主色系，传达专业、规范与沉稳)，重点辅色/交互色为亮青蓝色 `#04D5FF` (用于交互高亮与科技感点缀)。
- **字型选择**: 
  - 标题字体: 默认系统无衬线 (San Francisco / PingFang SC / Microsoft YaHei)，保障移动端和桌面端最佳阅读性。
  - 正文字体: 同上，为保障信息呈现一致性选用系统级字体族。
- **圆角级别**: `soft` 到 `round` 结合 (卡片组件使用 8-12px 的柔和圆角，以拉近距离增加亲和力；头像/按钮可视情全圆角)。
- **阴影使用**: `subtle` (微弱环境阴影，提升层次感以防扁平带来的层级缺失)。
- **图标风格**: 线性 (`line`) 为主导，选中及状态提示使用面性 (`filled`)。

---

## 1. 颜色系统

### 1.1 基础色板（Primitive Tokens）
作为语义 Token 的值来源，不允许在业务代码或样式中绝直接书写 HEX 值：
- `color-navy-50` → #E6F3FB
- `color-navy-500` → #005A9E
- `color-navy-700` → #00375D
- `color-cyan-500` → #04D5FF

### 1.2 语义 Token（Semantic Tokens）

支持移动端及 PC 后台的深色模式（Dark Mode）无缝切换：

| Token | 亮色值 (Light) | 暗色值 (Dark) | 用途说明 |
|-------|--------|--------|------|
| `color-bg-primary` | #FFFFFF | #0F172A | 页面主背景（微门户主轴） |
| `color-bg-secondary` | #F8FAFC | #1E293B | 区域/卡片背景（新闻列表块、表单区） |
| `color-bg-elevated` | #FFFFFF | #334155 | 悬浮元素（弹出筛选项、下拉菜单） |
| `color-text-primary` | #0F172A | #F1F5F9 | 主文字（校友名字、新闻标题） |
| `color-text-secondary` | #475569 | #94A3B8 | 辅助文字（发布时间、表单注释说明） |
| `color-text-disabled` | #CBD5E1 | #475569 | 禁用状态文字（未满足报名条件） |
| `color-border-default` | #E2E8F0 | #334155 | 默认分隔线/边框 |
| `color-border-strong` | #94A3B8 | #64748B | 强调边框（焦点状态） |
| `color-accent` | #00375D | #04D5FF | 品牌强调色（深邃海军蓝，核心CTA如“身份认证”） |
| `color-interactive` | #04D5FF | #00E5FF | 交互/辅助色（亮青蓝色，状态悬浮及高亮） |
| `color-danger` | #EF4444 | #F87171 | 危险/错误（如认证被拒、名额超限） |
| `color-success` | #22C55E | #4ADE80 | 成功状态（审核秒批通过、打卡核销有效） |

---

## 2. 间距系统

基于 8px 律动体系构建全局间距系统。

| Token | 值 | 用途 |
|-------|----|------|
| `space-1` | 4px | 极小间距（新闻 Tag 与文字间紧凑排列） |
| `space-2` | 8px | 小间距（表单 Icon 与 Input 文字、行间距） |
| `space-3` | 12px | 中小间距（列表项的内间距） |
| `space-4` | 16px | 基本间距（移动端主体内容区的基础 padding） |
| `space-6` | 24px | 中间距（卡片与卡片之间、大区块分隔） |
| `space-8` | 32px | 大间距（节区间隔、PC管理后台的模块间隔） |
| `space-12` | 48px | 超大间距（页头页脚空隙、捐赠大屏滚动间隔） |

页面内边界推荐方案：移动端使用 `space-4` 居多；Tablet 及 PC 大屏区域使用 `space-6` 或 `space-8`。

---

## 3. 字体系统

**字体栈**:
- 标题: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
- 正文: `system-ui, -apple-system, sans-serif`
- 数字/代码 (主要针对编号、捐赠单号): `ui-monospace, Consolas, "Courier New", monospace`

| Token | 字号 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `text-xs` | 12px | 16px | 400 | 新闻发布时长、徽章标签、极次要文字 |
| `text-sm` | 14px | 20px | 400 | 表单说明提示、次要辅文信息 |
| `text-base` | 16px | 24px | 400 | 主体正文、资讯详情内容阅读基准 |
| `text-lg` | 18px | 28px | 500 | 表单区块名、弹窗操作提示语 |
| `text-xl` | 20px | 28px | 600 | 页面栏目小标题（移动端段落） |
| `text-2xl` | 24px | 32px | 600 | 页面主标题、电子校友卡名字高亮 |
| `text-4xl` | 36px | 40px | 700 | 数据看板大数、大屏捐赠额数字、纪念证突出标语 |

---

## 4. 形状系统（圆角 + 阴影）

### 4.1 圆角 Token

| Token | 值 | 用途 |
|-------|----|------|
| `radius-sm` | 4px | 小标签、输入框微圆角、复选框 |
| `radius-md` | 8px | 列表图片、标准按钮、轻量卡片（微端常用） |
| `radius-lg` | 12px | 突出卡片（如首页轮播、电子校友卡卡面）、模态弹窗 |
| `radius-full` | 9999px | 全圆角按钮、校友头像、胶囊状标签 |

### 4.2 阴影 Token

| Token | 值 (Light 模式推演) | 用途 |
|-------|------------------|------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,.05)` | 微浮起边线（底部导航条提升） |
| `shadow-md` | `0 4px 6px rgba(0,0,0,.07)` | 通用卡片容器、独立的内容块 |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,.1)` | 常规弹出框、下拉菜单筛选项 |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,.15)` | 中心模态框、核心办事悬浮长通入口 (FAB) |

*(暗色模式下，阴影颜色相应加深或转换为内凹的 border 高亮体系以增强立体感)*

---

## 5. 断点系统 (Breakpoints)

支持平台的多端适配（微信小程序/H5、PC端管理员看板与大屏发布体系）。

| 名称 | 最小宽度 | 布局变化说明 |
|------|---------|---------|
| `mobile` | 0px | 基础一列表格布局，底部/顶部 TabBar 导航。 |
| `tablet` | 768px | 两列（PC后台收缩态），卡片瀑布流展现规则改变。 |
| `desktop` | 1024px | PC端系统控制台左侧 Nav 导航+右侧全宽内容区模式。 |
| `wide` | 1280px+ | 可视化数据大屏、捐赠大屏播报专用高限制，限定内容最大主展宽度。 |

---

## 6. 组件体系概览

### 6.1 原子组件 (Atoms)

| 组件 | 变体 | 状态 | 涉及的核心 Token |
|------|------|------|-----------|
| `Button` | primary/secondary/ghost/danger | default/hover/active/disabled/loading | `color-accent`, `radius-md` |
| `TextField` | text/number/idcard/search | unfocus/focus/error/disabled/readonly | `color-border-default`, `radius-sm` |
| `Badge` | default/honor/success/warning/danger | — | `color-honor`, `color-success`, `text-xs` |
| `Avatar` | sm/md/lg/xl | default/loading | `radius-full` |
| `Icon` | line/filled | default/muted/accent | `color-text-primary`, `color-accent` |

### 6.2 分子组件 (Molecules)

| 组件 | 子组件结构 | 场景用法示例 |
|------|----------|-----------|
| `FormItem` | Title + TextField/Picker + 验证报红文本 | 校友资料补充（多行结构表单项） |
| `NewsCard` | Image + 标题(text-base) + 底部信息(text-xs时间) | 首页动态资讯缩略摘要图文流组件 |
| `BottomBar`| Icon列表 + 响应式触控底框 | 移动端入口底导（首页/办事/我） |
| `Toast` | 提示Icon + `text-sm`提示文本 | "核销成功"或"报名满额"弱提醒悬浮 |
| `QrCodeBox`| 二维码容器 + 背景光晕 + 失效遮罩态 | 电子校友卡核心亮码区（需要支持动态防截图更新） |

### 6.3 有机组件 (Organisms)

| 组件 | 核心职责与上下文 | 关键状态 | 承载页面 |
|------|------------------|---------|---------|
| `AlumniIdentityForm`| 集成多重 `FormItem` 收集注册数据（如学号/毕业年份）及上传底库拦截，包含提交业务。 | idle/submitting/pending/rejected | 身份认证流 |
| `E-CampusCard` | 将头像信息、基础卡面、动态QR核查码与权益章结合的复杂复合层，用于保安视角的出示。 | loading/active/expired | 电子校友卡专区 |
| `DonationCheckout` | 项目信息区 + 阶梯金额选取按钮组 + 发起三方支付调用桥接。 | selecting/paying/success | 捐赠大厅 |
| `AuditWorkflowPool` | PC端审核长列表表单区域，包含多选勾选器、快审人脸对比框、操作组面板。 | loading/empty/paged | 工单控制台(PC) |

---

## 7. 核心组件 API 规格示例

以门禁与身份展示所需的 `E-CampusCard` 为例：

```typescript
// E-CampusCard 组件 API

interface ECampusCardProps {
  // --- 数据 ---
  alumniId: string;
  name: string;
  avatarUrl?: string; // 校友头像
  graduationInfo: string; // 诸如 "届别 / 院系"
  
  // --- 状态控制 ---
  isActive: boolean; // 是否处于白名单正常授权期限内
  refreshInterval?: number; // QR码动态刷新周期(ms)，防截图，默认 30000ms
  
  // --- 事件回调 ---
  onRefreshQR: () => Promise<string>; // 触发拉取最新凭证码序列逻辑
  onPressDetail: () => void; // 用户点击查阅背面权益或更详尽学籍信息
}
```

---

## 8. 可访问性规格 (Accessibility)

为确保包含老年校友及有特定障碍（如视力减退）用户的有效访问，系统需满足以下底线：

- **触控热区 (Touch Targets)**：移动端涉及办事表单、认证点击、底导区域，所有可交互按钮与热区不低于 **44×44px**。
- **色彩对比度 (Color Contrast)**：界面中文字与背景色对比度，正文需 ≥ 4.5:1，大标题/核心强调态 ≥ 3:1。（如浅灰背景不可使用浅色字以免不可读）。
- **信息不依赖单重感知**：表单出错不只依赖 `color-danger` 的红色框，必须附加清晰的文本提示 `“请输入正确的XX格式”` 和 Icon 图标。
- **动态提醒降噪**：如果加载时间过长或工单提交，使用 `aria-live` 提供异步结果播报。
- **焦点清晰 (Focus Visible)**：在 PC 端操作审批列表和发布表单时，保持 `color-border-strong` 为基础的焦点外显框，保障快捷键处理效率。

---

## 9. 开发交接清单

- [ ] 所有 Design Token 已正确导出至前端工程 (`tailwind.config.js` 等或 CSS/LESS Variables 中)。
- [ ] PC端深色模式与移动端深色跟随系统的样式体系测试穿透。
- [ ] 全部原子组件和分子组件已在 Storyboard / 组件库系统预建并具备交互态。
- [ ] QR 码防截图的遮盖层与前端业务组件通信联调通过。
- [ ] 已核实验收《可访问性热区与色彩对比规范》底线条件符合要求。