# 开发手册 · 白云学院超星智慧校友服务平台

> 适用于 Phase 1a 脚手架。业务功能在 Phase 1b+ 开发。

## 1. 环境准备（Windows 11）

| 工具 | 版本 | 安装方式 |
|------|------|---------|
| Node.js | 20.11+ （仓库已验证 22.17） | https://nodejs.org |
| pnpm | 10.8.1 | `corepack enable; corepack prepare pnpm@10.8.1 --activate` |
| Git | 任意 | https://git-scm.com |

可选：PostgreSQL 15（生产使用，dev 默认用嵌入式 pglite）、Redis 7（生产使用，dev 默认 ioredis-mock）。

## 2. 目录速查

```
apps/         前端 + BFF + Server
services/     领域模块（被 apps/server 装配）
packages/     共享库（tokens / contracts / db / cache / adapters ...）
tools/        codegen + 脚本
```

## 3. 常用命令

```powershell
pnpm install             # 安装所有依赖
pnpm turbo run typecheck # 全量类型检查
pnpm turbo run lint      # 全量 lint
pnpm turbo run test      # 全量单测
pnpm turbo run build     # 全量构建
pnpm gen:api             # 由 OpenAPI 生成 TS 类型
```

## 4. 启动脚本说明

| 脚本 | 作用 |
|------|------|
| `tools\scripts\start.bat` | 并行启动 server / bff / admin-web / alumni-h5 四个进程 |
| `tools\scripts\reset-db.bat` | 重建 pglite 嵌入式数据库并注入 5 位合成校友 |
| `tools\scripts\stop.bat` | 终止 start.bat 派生的 Node 进程 |
| `tools\scripts\ci.ps1` | 执行 lint → typecheck → test → build，产物归档 |

所有 BAT 脚本使用 `chcp 65001 > nul` 保证中文输出。

## 5. 数据库

- **dev**：`DATABASE_URL=pglite:./.data/pg`，使用 `@electric-sql/pglite` 嵌入式 WASM，零安装。
- **production**：`DATABASE_URL=postgresql://user:pass@host:5432/bynu`。

`packages/db` 暴露 `createDbClient(url)` 统一工厂，自动按 scheme 切换。

## 6. 缓存

- **dev**：`REDIS_URL=mock://local`，使用 `ioredis-mock` 内存实现。
- **production**：`REDIS_URL=redis://host:6379/0`。

## 7. 机密

所有机密通过环境变量注入（参见 `.env.example`）。
仓库中保留的 `ENCRYPTION_KEY` 仅为 dev 占位，生产必须替换为 32 字节强随机值（`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`）。

## 8. 健康检查

| 端点 | 说明 |
|------|------|
| `GET http://localhost:3000/internal/health` | BFF 健康：`{status, deps:{db,cache}, version}` |
| `GET http://localhost:3001/internal/health` | Server 健康 |

## 9. 下一步

Phase 1b 将在身份认证、门户 CMS、活动引擎、捐赠四条线并行展开。参见：
- `.sisyphus/runs/2026-04-17-211321/plans/p2-architecture-blueprint.md`
- `docs/stories/`
- `docs/ui/page-map.md`
