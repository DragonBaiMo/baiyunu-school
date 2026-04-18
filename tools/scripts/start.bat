@echo off
chcp 65001 > nul
cd /d "%~dp0..\.."

echo.
echo ===== 白云学院智慧校友服务平台 - 本地开发启动 =====
echo.

where pnpm > nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 pnpm，请先安装 Node 22+ 与 pnpm 10+
  pause
  exit /b 1
)

where node > nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 node，请先安装 Node 22+
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    echo [启动] 未发现 .env，已从 .env.example 复制。请按需修改后重新运行。
    copy /Y ".env.example" ".env" > nul
  ) else (
    echo [警告] 未发现 .env 与 .env.example，将使用默认环境。
  )
)

if not exist "node_modules" (
  echo [启动] 首次安装依赖（3-6 分钟）...
  call pnpm install
  if errorlevel 1 (
    echo [错误] 依赖安装失败。
    pause
    exit /b 1
  )
)

if not exist ".data\pg" (
  echo [启动] 未检测到本地数据库，尝试注入种子数据...
  call pnpm -F @bynu/db run seed
  if errorlevel 1 (
    echo [提示] 种子脚本未执行成功或不存在，将在应用层按需初始化。
  )
)

echo.
echo [启动] 正在拉起 4 个开发进程（每个独立窗口，可单独查看日志）...
start "白云·后端" /MIN cmd /c "pnpm -F @bynu/server start:dev"
start "白云·BFF" /MIN cmd /c "pnpm -F @bynu/bff-gateway start:dev"
start "白云·管理端" /MIN cmd /c "pnpm -F @bynu/admin-web dev"
start "白云·H5端" /MIN cmd /c "pnpm -F @bynu/alumni-h5 dev"

echo [启动] 等待 10 秒让进程就绪...
ping -n 11 127.0.0.1 > nul

echo.
echo [启动] 健康检查...
curl -f -s -o nul http://localhost:3001/internal/health
if errorlevel 1 (
  echo   [后端]   http://localhost:3001/internal/health  异常（请查看"白云·后端"窗口日志）
) else (
  echo   [后端]   http://localhost:3001/internal/health  200 OK
)

curl -f -s -o nul http://localhost:3000/api/v1/public/ping
if errorlevel 1 (
  echo   [BFF]    http://localhost:3000/api/v1/public/ping  异常（请查看"白云·BFF"窗口日志）
) else (
  echo   [BFF]    http://localhost:3000/api/v1/public/ping  200 OK
)

curl -f -s -o nul http://localhost:5173/
if errorlevel 1 (
  echo   [管理端] http://localhost:5173/  未就绪（vite 首次编译可能需要更长时间）
) else (
  echo   [管理端] http://localhost:5173/  200 OK
)

curl -f -s -o nul http://localhost:5174/
if errorlevel 1 (
  echo   [H5端]   http://localhost:5174/  未就绪（vite 首次编译可能需要更长时间）
) else (
  echo   [H5端]   http://localhost:5174/  200 OK
)

echo.
echo ===== 访问入口 =====
echo   BFF 网关    : http://localhost:3000
echo   后端服务    : http://localhost:3001
echo   PC 管理端   : http://localhost:5173
echo   校友 H5     : http://localhost:5174
echo   微信小程序  : 见 apps\alumni-miniapp\README.md
echo.
echo [启动] 停止全部进程：双击 tools\scripts\stop.bat
echo.
pause
