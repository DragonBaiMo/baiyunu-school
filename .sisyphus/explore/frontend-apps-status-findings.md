# 前端 App 实现状态探索报告

## 1. admin-web（PC 端管理后台）

### 1.1 路由/页面（3 个页面 + 1 个路由守卫）

| 路由 | 页面文件 | 实现程度 |
|------|---------|---------|
| `/login` | `pages/login.tsx` | **较完整**：zod schema 校验的登录表单（react-hook-form），含 username/password 字段、表单验证消息，使用 shadcn 风格 Card/Form/Input/Button。但 onSubmit 只是 console.log 占位，无 API 调用 |
| `/dashboard` | `pages/dashboard.tsx` | **骨架**：带 RequireAuth 路由守卫，展示 4 个导航卡片（校友管理/活动运营/捐赠管理/系统设置），有退出登录按钮（清 token）。所有卡片链接指向 /dashboard 自身，注释标注 Phase 1f 起接入真实数据 |
| `*` (404) | `pages/not-found.tsx` | **完成**：404 页面，含返回登录链接 |
| `/` | — | 重定向到 `/login` |

路由模式：`createBrowserRouter`（react-router-dom v7），App 层只做 `<Outlet />`。

### 1.2 组件（admin-web 本地 shadcn 组件）

路径：`src/components/ui/`

| 组件文件 | 内容 |
|---------|------|
| `button.tsx` | CVA 驱动，4 variant（default/outline/ghost/danger）× 3 size（sm/md/lg），支持 asChild（Slot） |
| `card.tsx` | Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter 6 个子组件 |
| `form.tsx` | 完整 react-hook-form 集成：Form/FormField/FormItem/FormLabel/FormControl/FormMessage，含 Context + useFormField hook |
| `input.tsx` | 基础 Input 组件，design-token 样式 |
| `label.tsx` | Radix Label 封装 |

### 1.3 Lib 工具

| 文件 | 内容 |
|------|------|
| `lib/auth.ts` | localStorage 读写 token（getToken/setToken/isAuthenticated），注释说明 Phase 1b 替换为 httpOnly Cookie |
| `lib/utils.ts` | `cn()` 函数（clsx + twMerge），shadcn 标准工具 |

### 1.4 样式

`styles/globals.css`：导入 `@bynu/design-tokens/tokens.css`，设置 Tailwind base/components/utilities，body 使用 CSS 变量。

### 1.5 依赖

核心：React 18.3.1, react-router-dom 7.0.2, react-hook-form 7.53.2, zod 3.23.8, framer-motion 11.11.17, lucide-react 0.468.0
UI：@radix-ui/react-label, @radix-ui/react-slot, class-variance-authority 0.7.0, clsx, tailwind-merge
内部：@bynu/design-tokens, @bynu/ui

---

## 2. alumni-h5（移动端校友 H5）

### 2.1 路由/页面（3 个页面）

| 路由 | 页面文件 | 实现程度 |
|------|---------|---------|
| `/home` | `pages/HomePage.tsx` | **骨架完整**：Hero 区（深蓝背景 + 标题 + CTA 按钮）、金刚区（4 宫格：校友卡/活动/捐赠/新闻）、新闻列表（3 条硬编码占位）。视觉元素丰富但数据全为占位 |
| `/card` | `pages/CardPage.tsx` | **纯占位**：仅标题 + 说明文字，注释 Phase 1b 接入动态 QR 与荣誉徽章 |
| `/login` | `pages/LoginPage.tsx` | **纯占位**：仅标题 + 说明文字，注释 Phase 1b 接入身份认证漏斗 |

路由模式：`BrowserRouter` + `<Routes>`（声明式），`/` 重定向到 `/home`。无路由守卫，无 404 处理。

### 2.2 组件（H5 本地组件）

路径：`src/components/`

| 组件文件 | 内容 |
|---------|------|
| `Button.tsx` | forwardRef，2 variant（primary/ghost），clsx + twMerge，design-token 样式 |
| `Card.tsx` | forwardRef，圆角边框卡片容器，design-token 样式 |

### 2.3 Lib 工具

| 文件 | 内容 |
|------|------|
| `lib/format.ts` | `maskScore()` 函数，数字脱敏为段显示 |

### 2.4 样式

`styles/globals.css`：同 admin-web 结构，导入 `@bynu/design-tokens/tokens.css`，Tailwind 三层。

### 2.5 依赖

核心：React 18.3.1, react-router-dom 7.0.2, lucide-react 0.468.0
UI：clsx, tailwind-merge
内部：@bynu/design-tokens, @bynu/ui
**不含**：react-hook-form, zod, framer-motion, radix-ui, CVA（比 admin-web 精简）

---

## 3. packages/ui（共享 UI 包）

**极简状态**。`src/index.ts` 只导出：
- `cx()` 函数：简单的 className 拼接（非 clsx 依赖）
- `BRAND` 常量：productName + version

无任何 React 组件。注释说明 Phase 1b 起从 admin-web 和 alumni-h5 沉淀 shadcn 二次封装组件。

package.json：peerDependencies react ^18.3.0，无实际组件依赖。

---

## 4. packages/design-tokens（设计令牌包）

### 4.1 Token 定义（`src/tokens.ts`）

| 类别 | 内容 |
|------|------|
| **原始色（10 个）** | navy-50/500/700, cyan-500, gold-500/300, warm-red-500/300, sky-500/300 |
| **语义色（15 个，含 light/dark）** | bg-primary/secondary/elevated, text-primary/secondary/disabled, border-default/strong, accent, interactive, danger, success, honor-gold, emotion-red, data-accent |
| **间距（7 级）** | space-1(4px) ~ space-12(48px) |
| **圆角（4 级）** | radius-sm(4px) ~ radius-full(9999px) |
| **阴影（4 级）** | shadow-sm ~ shadow-xl |
| **断点（4 级）** | mobile(0) / tablet(768) / desktop(1024) / wide(1280) |
| **字号（7 级）** | text-xs(12px) ~ text-4xl(36px)，含 lineHeight + weight |
| **字体族（3 个）** | sans / serif / mono |
| **动效（4 个）** | qr-rotate / step-progress / data-pulse / canvas-snap |

### 4.2 构建产物（`src/build.ts`）

生成 4 种格式到 `dist/`：
- `tokens.css`：CSS 变量，含 `[data-theme="dark"]` 暗色主题
- `miniapp.wxss`：小程序变量
- `tokens.json`：JSON 消费
- `tailwind.preset.js`（通过 tsc 编译）

### 4.3 Tailwind Preset（`src/tailwind.preset.ts`）

`buildTailwindPreset()` 将 tokens 映射到 Tailwind `theme.extend`：colors / spacing / borderRadius / boxShadow / screens / fontSize / fontFamily。

### 4.4 包导出

- `.` → dist/index.js（tokens 对象 + buildTailwindPreset）
- `./tailwind-preset` → dist/tailwind.preset.js
- `./tokens.css` → dist/tokens.css
- `./miniapp.wxss` → dist/miniapp.wxss
- `./tokens.json` → dist/tokens.json

---

## 5. Tailwind 配置

两个 app 的 `tailwind.config.ts` **完全相同**：
- content：`./index.html` + `./src/**/*.{ts,tsx,html}`
- presets：`[buildTailwindPreset()]`（从 @bynu/design-tokens/tailwind-preset 导入）
- theme.extend 和 plugins 均为空（全部靠 preset）

---

<results>
<files>
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\App.tsx:1 — App 根组件，Outlet 容器，使用 design-token 背景/文字色
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\main.tsx:1 — 入口，StrictMode + RouterProvider
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\router.tsx:1 — createBrowserRouter，3 路由 + RequireAuth 守卫
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\login.tsx:1 — 登录页，zod+react-hook-form 表单（占位提交）
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\dashboard.tsx:1 — 仪表盘，4 导航卡片骨架
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\not-found.tsx:1 — 404 页
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\components\ui\button.tsx:1 — CVA Button，4 variant × 3 size
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\components\ui\card.tsx:1 — Card 系列 6 子组件
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\components\ui\form.tsx:1 — react-hook-form 集成表单组件
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\components\ui\input.tsx:1 — Input 组件
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\components\ui\label.tsx:1 — Radix Label 封装
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\lib\auth.ts:1 — localStorage token 管理（Phase 1a 占位）
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\lib\utils.ts:1 — cn() className 合并工具
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\styles\globals.css:1 — 全局样式，导入 design-tokens CSS
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\package.json:1 — 依赖清单
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\tailwind.config.ts:1 — Tailwind 配置，使用 design-tokens preset
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\App.tsx:1 — BrowserRouter + 3 路由
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\main.tsx:1 — 入口，StrictMode + App
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\HomePage.tsx:1 — 首页，Hero+金刚区+新闻列表骨架
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\CardPage.tsx:1 — 电子校友卡占位页
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\LoginPage.tsx:1 — 登录占位页
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\components\Button.tsx:1 — H5 Button，2 variant
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\components\Card.tsx:1 — H5 Card 容器
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\lib\format.ts:1 — maskScore 数字脱敏
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\styles\globals.css:1 — 全局样式
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\package.json:1 — 依赖清单（精简版）
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\tailwind.config.ts:1 — Tailwind 配置
- i:\CustomBuild\Other\baiyunu-school\packages\ui\src\index.ts:1 — 仅 cx() + BRAND，无 React 组件
- i:\CustomBuild\Other\baiyunu-school\packages\ui\package.json:1 — UI 包配置
- i:\CustomBuild\Other\baiyunu-school\packages\design-tokens\src\tokens.ts:1 — 完整 Token 定义（色彩/间距/圆角/阴影/字号/字体/动效）
- i:\CustomBuild\Other\baiyunu-school\packages\design-tokens\src\tailwind.preset.ts:1 — Tailwind preset 构造器
- i:\CustomBuild\Other\baiyunu-school\packages\design-tokens\src\build.ts:1 — 多格式构建脚本（CSS/WXSS/JSON）
- i:\CustomBuild\Other\baiyunu-school\packages\design-tokens\src\index.ts:1 — 包入口 re-export
- i:\CustomBuild\Other\baiyunu-school\packages\design-tokens\package.json:1 — 5 个 exports 路径
</files>

<answer>
两个前端 app 均处于 Phase 1a 脚手架阶段：

**admin-web**：3 个路由（login/dashboard/404），login 页表单完整但无 API 调用，dashboard 是 4 卡片导航骨架。本地有 5 个 shadcn 风格组件（button/card/form/input/label），认证用 localStorage 占位。

**alumni-h5**：3 个路由（home/card/login），home 页视觉骨架最完整（Hero+金刚区+新闻列表），card 和 login 均为纯文字占位。本地 2 个组件（Button/Card），无表单、无认证逻辑。

**packages/ui**：空壳，仅 cx() 工具函数和 BRAND 常量，无任何 React 组件。两个 app 的组件完全独立，尚未沉淀到共享包。

**packages/design-tokens**：Token 体系完备（10 原始色、15 语义色含暗色、7 级间距、4 级圆角、4 级阴影、7 级字号、4 个动效），通过 Tailwind preset 统一注入两个 app，构建输出 CSS/WXSS/JSON 三格式。

两个 app 的 Tailwind 配置完全相同，均依赖 design-tokens preset，无额外扩展。组件间存在明显重复（如 Button/Card），等待 Phase 1b 统一沉淀到 packages/ui。
</answer>

<confidence>
high — 已读取两个 app 下全部源码文件、packages/ui 和 design-tokens 的全部核心文件，信息完整。
</confidence>
</results>
