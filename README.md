# 白云学院超星智慧校友服务平台

> 面向校友全生命周期的一体化运营平台：入站门户、身份认证、组织档案、活动、捐赠、数据治理、名企联合就业等 8 大领域。Monorepo 架构，前后端分离，禁用 Docker，Windows 11 优先。

**版本**：0.1.0-alpha（Phase 1a 脚手架完成）
**生成时间**：2026-04-17

---

## 快速开始

1. **克隆仓库**
   ```powershell
   git clone <repo-url> baiyunu-school
   cd baiyunu-school
   ```
2. **安装 Node 22+ 与 pnpm 10+**
   ```powershell
   # 推荐 nvm-windows 安装 Node 22
   corepack enable
   corepack prepare pnpm@10.8.1 --activate
   ```
3. **初始化环境变量**
   ```powershell
   Copy-Item .env.example .env
   ```
4. **一键启动（任选其一）**
   ```powershell
   # 方式 A：双击
   tools\scripts\start.bat

   # 方式 B：命令行
   pnpm install
   pnpm dev:all
   ```

## 访问地址

| 端 | URL | 端口 |
|---|---|---|
| BFF 网关 | http://localhost:3000 | 3000 |
| 后端服务 | http://localhost:3001 | 3001 |
| PC 管理端 | http://localhost:5173 | 5173 |
| 校友 H5 | http://localhost:5174 | 5174 |
| 微信小程序 | 见 [apps/alumni-miniapp/README.md](apps/alumni-miniapp/README.md) | — |

## Monorepo 结构

| 目录 | 职责 |
|---|---|
| `apps/` | 可执行应用：`server`（NestJS 领域聚合）、`bff-gateway`（NestJS BFF）、`admin-web`（Vite+React PC 端）、`alumni-h5`（Vite+React 移动 H5）、`alumni-miniapp`（Taro 微信小程序） |
| `services/` | 8 个领域模块：identity / portal-cms / organization / activity / workflow / donation / etl / notification |
| `packages/` | 可复用包：`design-tokens`（Token 单源）/ `contracts`（OpenAPI+Zod）/ `db`（Prisma+PGlite）/ `cache`（ioredis+mock）/ `config` / `logger` / `auth` / `domain` / `ui` / `test-utils` / `adapters/*`（6 个外部系统适配器） |
| `tools/` | 工程脚本：`codegen`（API 生成）、`scripts`（start/stop/reset/ci） |
| `docs/` | PRD、Epic 用户故事、UI 设计规范 |
| `design-system/` | UI 设计系统主文档 |

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm install` | 安装全部 workspace 依赖 |
| `pnpm dev:all` | 并发启动 4 个开发进程（concurrently） |
| `pnpm turbo run typecheck` | 全量类型校验 |
| `pnpm turbo run test` | 全量单元测试 |
| `pnpm turbo run build --filter=!@bynu/alumni-miniapp` | 全量构建（miniapp 降级期间排除） |
| `pnpm ci` 或 `pwsh tools\scripts\ci.ps1` | 本地 CI 流水线：install → typecheck → lint → test → build → 归档 |
| `tools\scripts\start.bat` | 一键启动本地开发 |
| `tools\scripts\stop.bat` | 停止全部开发进程 |
| `tools\scripts\reset-db.bat` | 重置 PGlite 数据库 + 重注入种子 |
| `pnpm format` | Prettier 格式化 |

## 技术栈

- **后端**：NestJS 10、pino 日志、prom-client 指标、PGlite 0.2（嵌入式 PostgreSQL）、Prisma 6 schema、ioredis-mock（dev）→ ioredis（prod）
- **前端 PC**：React 18、Vite 5、Tailwind 3、shadcn 风格手写组件、react-hook-form + zod、react-router 7
- **前端 H5**：React 18、Vite 5、Tailwind 3、lucide-react
- **小程序**：Taro 4（Phase 1b 解除 DEGRADED）
- **契约**：OpenAPI 3.1 + zod
- **设计系统**：`@bynu/design-tokens` 单源，输出 CSS vars / Tailwind preset / 小程序 wxss / JSON
- **工程**：pnpm 10 workspaces + turbo 2 + tsup + vitest 2 + happy-dom
- **构建/运行**：Node ≥ 20.11（仓库已在 22.17 验证）、Windows 11 PowerShell 优先

## 关联文档

- **PRD**：[docs/prd.md](docs/prd.md)
- **设计系统**：[design-system/baiyunu-alumni-platform/MASTER.md](design-system/baiyunu-alumni-platform/MASTER.md)
- **开发手册**：[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Epic 用户故事**：[docs/stories/](docs/stories/)
- **Phase 1a 执行日志**：[.sisyphus/runs/2026-04-17-211321/logs/phase-1a/](.sisyphus/runs/2026-04-17-211321/logs/phase-1a/)
- **Phase 1a 交付摘要**：[.sisyphus/runs/2026-04-17-211321/phase-1a-delivery.md](.sisyphus/runs/2026-04-17-211321/phase-1a-delivery.md)

## 许可证

内部使用（白云学院 × 超星联合建设）。外部分发需经项目组授权。
