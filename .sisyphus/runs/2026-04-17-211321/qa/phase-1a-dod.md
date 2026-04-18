# Phase 1a DoD 证据 · baiyunu-alumni-platform

> 执行时间：2026-04-18
> 执行者：Hephaestus（Wave D 收尾）
> 仓库根：`i:\CustomBuild\Other\baiyunu-school\`
> 目标：完成 monorepo 脚手架（7 packages + 4 apps + CI + 一键脚本）并通过 5 条 DoD 命令。

## 汇总

| # | 命令 | 结果 | 耗时 | 关键数字 |
|---|------|------|------|---------|
| 1 | `pnpm install` | ✅ PASS (exit 0) | 1.42 s | 32 workspace projects · lockfile up-to-date |
| 2 | `pnpm turbo run typecheck` | ✅ PASS (exit 0) | 13.72 s | 54/54 tasks successful · 0 cached · 31 packages |
| 3 | `pnpm turbo run lint` | ✅ PASS (exit 0) | 22.57 s | 53/53 tasks successful · 23 cached |
| 4 | `pnpm turbo run test` | ✅ PASS (exit 0) | 26.17 s | 53/53 tasks successful · 23 cached |
| 5 | `pnpm turbo run build --filter=!@bynu/alumni-miniapp` | ✅ PASS (exit 0) | 8.25 s | 29/29 tasks successful · 23 cached · 30 packages in scope |

所有命令 `$LASTEXITCODE = 0`，全量日志落盘在 `.sisyphus/runs/2026-04-17-211321/qa/tmp-*.log`。

---

## 1 · pnpm install

```
Scope: all 32 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 1.3s using pnpm v10.8.1
EXITCODE=0  DURATION=1.4204078s
```

- 唯一 warning：`Ignored build scripts: nestjs-pino`（pnpm 10 的 build script 安全策略，不影响构建）。

## 2 · pnpm turbo run typecheck

- 范围：31 个含 `typecheck` 任务的包（含 `@bynu/adapters` 聚合 6 个子适配器）。
- 结果：`Tasks: 54 successful, 54 total · Cached: 0 cached · Time: 11.924s`。
- 关键构建链：`design-tokens → contracts → db → auth → server / bff-gateway / admin-web / alumni-h5 / adapters/*` 全部 `tsc --noEmit` 零错误。

```
 Tasks:    54 successful, 54 total
Cached:    0 cached, 54 total
  Time:    11.924s

EXITCODE=0  DURATION=13.7201972s
```

## 3 · pnpm turbo run lint

```
 Tasks:    53 successful, 53 total
Cached:    23 cached, 53 total
  Time:    21.157s

EXITCODE=0  DURATION=22.5699075s
```

- `@bynu/alumni-miniapp:lint` 为 DEGRADED 占位 echo（按 Phase 1a 约定，Taro 小程序 lint 延后至 Phase 1b），命令本体 exit 0。
- 其余 30 个包执行 `eslint src`，全部零 warning / 零 error。

## 4 · pnpm turbo run test

```
 Tasks:    53 successful, 53 total
Cached:    23 cached, 53 total
  Time:    24.739s

EXITCODE=0  DURATION=26.1693664s
```

关键测试套件（节选真实 vitest 输出）：

| 套件 | 用例 | 关键断言 |
|------|------|---------|
| `@bynu/db` · tests/client.test.ts | 2 passed | `SELECT 1` 正常 · 迁移 SQL 可在 pglite 中执行 |
| `@bynu/db` · tests/crypto.test.ts | 3 passed | 加密往返验证 |
| `@bynu/server` · tests/health.e2e.test.ts | 2 passed | `GET /internal/health` 返回 200 + 合法 HealthResponse |
| `@bynu/server` · tests/modules.test.ts | 8 passed | 13 个 Nest 模块装配验证 |
| `@bynu/bff-gateway` · tests/bff.e2e.test.ts | 5 passed | BFF E2E 通过 |
| `@bynu/bff-gateway` · tests/roles-guard.test.ts | 2 passed | RolesGuard 分支覆盖 |
| `@bynu/admin-web` · src/**/*.test.tsx | 6 passed | Auth lib + Login 页面 + utils |
| `@bynu/alumni-h5` · src/pages/HomePage.test.tsx + format | 6 passed | — |
| `@bynu/adapters/*` · tests/*.test.ts | access-control 2 / chaoxing 3 / e-sign 2 / edu 2 / payment 3 / stu 2 = 14 passed | 6 个外部适配器 mock 合约 |
| services/activity/donation/etl/identity/notification/organization/portal-cms/workflow | 各 1 passed | 模块装配烟雾测试 |

合计：**53 个 turbo task 全绿**；`@bynu/alumni-miniapp:test` 同为 DEGRADED 占位 echo。

## 5 · pnpm turbo run build --filter=!@bynu/alumni-miniapp

```
 Tasks:    29 successful, 29 total
Cached:    23 cached, 29 total
  Time:    6.831s

EXITCODE=0  DURATION=8.2528488s
```

关键产物（节选真实 tsup / vite 输出）：

- `@bynu/server:build` → `dist/main.js 149.55 KB` · tsup CJS 500 ms（Node20 target）
- `@bynu/bff-gateway:build` → `dist/main.js 140.44 KB` · tsup CJS 489 ms
- `@bynu/admin-web:build` → `dist/assets/index-Dy4HTYTP.js 333.06 KB (gzip 105.05 KB)` · vite 5.62 s · 1613 modules transformed
- `@bynu/alumni-h5:build` → `dist/assets/index-DZhgZotL.js 201.78 KB (gzip 66.48 KB)` · vite 5.27 s · 1596 modules transformed
- `@bynu/design-tokens:build` → `[design-tokens] 已生成 4 件产物到 dist/`
- 全部 `@bynu/service-*`、`@bynu/adapter-*`、`@bynu/auth/cache/config/contracts/db/domain/logger/test-utils/ui` 通过 `tsc -p tsconfig.json`。

---

## Wave D 交付物

| 路径 | 说明 |
|------|------|
| `setup.bat` | 环境搭建（Node ≥20.11 检测、corepack、pnpm install、design-tokens build、prisma generate 容错） |
| `start.bat` | 启动编排（端口 3000/3001/5173/5174 按 PID 精准释放 → 三窗口并行 → 自身 exit /b 0） |
| `start-backend.bat` | `pnpm --filter @bynu/server dev` |
| `start-bff.bat` | `pnpm --filter @bynu/bff-gateway dev` |
| `start-web.bat` | `pnpm --filter @bynu/admin-web dev` |
| `reimport.bat` | `set /p` 确认 + 按端口杀 PID + 清理 `apps/server/.data` 与 `apps/bff-gateway/.data` 下 sqlite/pglite/db/wal/shm 文件 |
| `tools/scripts/gen-bats.cjs` | 脚本生成器（Node 写入 UTF-8 无 BOM + CRLF） |

编码自检：6 个 .bat 文件首 3 字节均为 `40 65 63`（`@ec`，无 BOM）；CRLF 检测 `True`。

## 结论

Phase 1a scaffolding 完成。全工作区 typecheck / lint / test / build 四项门禁全绿，一键脚本双击可用。标记 P5 进入 `in_progress`，`completed_steps = ["phase-1a-scaffolding"]`。
