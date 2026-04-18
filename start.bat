@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo =====================================
echo [start] 启动白云学院校友平台
echo =====================================

if not exist "%ROOT%node_modules" (
  echo [错误] 未检测到 node_modules，请先运行 setup.bat
  exit /b 1
)

echo [1/3] 释放端口 3000 / 3001 / 5173 / 5174 ...
for %%P in (3000 3001 5173 5174) do call :KILL_PORT %%P

echo [2/3] 拉起子服务窗口 ...
start "bynu-backend" cmd /k ""%ROOT%start-backend.bat""
start "bynu-bff"     cmd /k ""%ROOT%start-bff.bat""
start "bynu-web"     cmd /k ""%ROOT%start-web.bat""

echo [3/3] 服务访问地址：
echo   后端 NestJS  : http://localhost:3001
echo   BFF Gateway  : http://localhost:3000
echo   Admin Web    : http://localhost:5173
echo.
echo 子窗口已在后台启动，关闭对应窗口即可停止服务
echo =====================================
endlocal
exit /b 0

:KILL_PORT
set "PORT=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  echo   端口 %PORT% 被进程 %%a 占用，正在结束 ...
  taskkill /PID %%a /F >nul 2>&1
)
goto :eof
