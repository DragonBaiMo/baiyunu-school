@echo off
chcp 65001 >nul
cd /d "%~dp0"
title bynu-web (@bynu/admin-web :5173)
echo [web] 启动 @bynu/admin-web（Vite @ 5173）...
call pnpm --filter @bynu/admin-web dev
if errorlevel 1 (
  echo [web] 进程异常退出 errorlevel=%errorlevel%
  pause
  exit /b 1
)
