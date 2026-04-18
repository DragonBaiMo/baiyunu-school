@echo off
chcp 65001 >nul
cd /d "%~dp0"
title bynu-backend (@bynu/server :3001)
echo [backend] 启动 @bynu/server（NestJS @ 3001）...
call pnpm --filter @bynu/server dev
if errorlevel 1 (
  echo [backend] 进程异常退出 errorlevel=%errorlevel%
  pause
  exit /b 1
)
