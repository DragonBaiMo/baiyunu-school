# 白云大学校友平台 · 微信小程序

原生微信小程序版本，**学生端 + 管理员端 二合一**，使用本地 `wx.setStorageSync` 做 mock 数据持久化，无需后端即可完整体验。

## 快速开始

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 在开发者工具中选择「导入项目」，目录指向本文件夹 `apps/alumni-miniapp/`。
3. AppID 选「测试号」（touristappid）即可本地预览。
4. 首次启动会自动注入演示数据（5 条资讯、5 场活动、6 位校友、捐赠统计等）。

## 演示账号

| 端 | 入口 | 账号 | 密码 |
|---|---|---|---|
| 学生 / 校友 | 首页 → 校友/学生端 → 一键超星登录 | — | 免密一键登录（张三 2016级计算机） |
| 学生 / 校友 | 首页 → 校友/学生端 → 自助登记 | 任意姓名 | 任意学号 |
| 管理员 | 首页 → 管理员端 | `admin` | `admin123` |

## 目录结构

```
apps/alumni-miniapp/
├── project.config.json
├── project.private.config.json
└── miniprogram/
    ├── app.js / app.json / app.wxss / sitemap.json
    ├── utils/
    │   ├── mock.js   # 种子数据 + 持久化 key
    │   ├── auth.js   # 登录态（token / user / role）
    │   └── api.js    # mock 数据操作层（读写 storage）
    └── pages/
        ├── launch/                角色入口
        ├── student-login/         校友登录
        ├── student-home/          校友首页
        ├── student-activities/    活动列表（分类筛选）
        ├── student-activity-detail/ 活动详情 + 报名
        ├── student-donate/        公益捐赠
        ├── student-me/            个人中心
        ├── admin-login/           管理员登录
        ├── admin-dashboard/       数据驾驶舱
        ├── admin-members/         成员审核
        ├── admin-activities/      活动发布/删除
        └── admin-news/            资讯发布/删除
```

## 功能矩阵

### 学生 / 校友端
- 首页：欢迎卡片 + 统计 + 快捷入口 + 最新资讯 + 热门活动
- 活动列表：分类筛选、进度条展示剩余名额
- 活动详情：立即报名（写入 storage，占用名额）
- 公益捐赠：选择项目 + 金额 → 写入订单 → 统计实时更新
- 我的：报名记录、捐赠记录、个人档案、退出登录

### 管理员端
- 驾驶舱：校友 / 活动 / 资讯 / 捐赠金额 KPI + 模块导航
- 成员管理：按状态筛选 + 通过 / 驳回（双向改写 storage）
- 活动管理：新增（分类 / 名额 / 日期）、删除
- 资讯管理：发布 / 删除

## 数据持久化

| Key | 说明 |
|---|---|
| `mock_news` | 资讯列表 |
| `mock_activities` | 活动列表 |
| `mock_donation_stats` | 捐赠总览 |
| `mock_donation_orders` | 捐赠订单 |
| `mock_enrollments` | 活动报名记录 |
| `mock_members` | 校友成员 |
| `mp_token` / `mp_user` / `mp_role` | 登录态 |

首次启动时由 `utils/mock.js#ensureMockSeed` 注入初始数据。

## 与 Web 版本

- Web 校友端：<https://dragonbaimo.github.io/baiyunu-school/>
- Web 管理端：<https://dragonbaimo.github.io/baiyunu-school/admin/>
- 小程序：本目录（需微信开发者工具预览 / 真机调试）

三端共用视觉语言（主色 `#0F2C5C` · 强调 `#D4AF37`），数据层各自独立。
# @bynu/alumni-miniapp（Phase 1a · DEGRADED）

## 状态

Phase 1a Wave C 按 spec 的「降级许可」条款落地为 **文档化占位**：
保留 workspace 注册与空壳脚本，不初始化 Taro 4.x 工程，避免在 pnpm workspaces
下的 `@tarojs/*` peer / hoist 解析风险阻塞 Wave C DoD。

## 计划结构（Phase 1b 接入）

```
apps/alumni-miniapp/
├─ config/
│  ├─ index.ts      # Taro 构建入口配置
│  ├─ dev.ts
│  └─ prod.ts
├─ project.config.json   # AppID 占位 "wx"
├─ src/
│  ├─ app.tsx
│  ├─ app.config.ts      # pages + tabBar（home/card/mine）
│  ├─ app.wxss           # @import '@bynu/design-tokens/miniapp.wxss'
│  ├─ pages/
│  │  ├─ home/{index.tsx, index.config.ts, index.wxss}
│  │  ├─ card/{index.tsx, index.config.ts, index.wxss}
│  │  └─ mine/{index.tsx, index.config.ts, index.wxss}
│  └─ assets/             # 空图标目录
└─ tsconfig.json
```

## 当前文件

- `src/app.ts`：三 Tab 常量声明（`TABS`），供 Phase 1b 迁入 `app.config.ts` 时复用。
- `tsconfig.json`：`paths: {}` 空覆盖，`jsx: preserve`。

## 脚本

| 脚本 | 行为 |
|------|------|
| `build:weapp` | echo DEGRADED，exit 0 |
| `dev:weapp` | echo DEGRADED |
| `typecheck` | 真正跑 tsc --noEmit（只校验 src/app.ts） |
| `test` | echo skip（Taro 测试栈 Phase 1b 补齐） |
| `lint` | echo skip |

## 解除降级的入口条件（Phase 1b）

1. 锁定 Taro 4.x 最小可用依赖集（`@tarojs/{cli,taro,components,runtime,react,shared,plugin-platform-weapp,plugin-framework-react,webpack5-runner,taro-loader}`）与 `babel-preset-taro`。
2. 验证在 pnpm workspaces hoist 策略（或 `.npmrc` 精确 public-hoist-pattern）下的 `@tarojs/cli build --type weapp` 可零阻塞产物落盘。
3. 以 `@bynu/design-tokens/miniapp.wxss` 为样式事实源，完成 home/card/mine 三 Tab 空壳页。
