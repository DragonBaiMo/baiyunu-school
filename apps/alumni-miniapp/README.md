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
