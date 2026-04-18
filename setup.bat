@echo off
chcp 65001 >nul
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo =====================================
echo [setup] 白云学院校友平台 环境搭建
echo =====================================

echo [1/5] 检查 Node 版本 ...
where node >nul 2>&1
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装 Node 20.11+
  exit /b 1
)
for /f "delims=" %%v in ('node -v') do set "NODE_VER=%%v"
echo 当前 Node 版本：%NODE_VER%
node -e "var v=process.versions.node.split('.').map(Number);if(v[0]<20||(v[0]===20&&v[1]<11)){console.error('[错误] Node 版本过低，需要 >= 20.11');process.exit(1)}"
if errorlevel 1 exit /b 1

echo [2/5] 启用 corepack ...
call corepack enable
if errorlevel 1 (
  echo [警告] corepack enable 失败，将直接使用系统 pnpm
)

echo [3/5] 安装 pnpm 依赖 ...
call pnpm install
if errorlevel 1 exit /b 1

echo [4/5] 构建 design-tokens（生成 CSS/Tailwind 变量）...
call pnpm turbo run build --filter=@bynu/design-tokens
if errorlevel 1 exit /b 1

echo [5/5] 尝试生成 Prisma Client（若存在 schema）...
if exist "%ROOT%packages\db\prisma\schema.prisma" (
  call pnpm --filter @bynu/db exec prisma generate
  if errorlevel 1 echo [提示] prisma generate 失败或未安装 prisma CLI，已忽略
) else (
  echo [提示] 未检测到 packages/db/prisma/schema.prisma，跳过
)

echo =====================================
echo [setup] 环境搭建完成
echo 下一步：双击 start.bat 启动服务
echo =====================================
endlocal
exit /b 0
