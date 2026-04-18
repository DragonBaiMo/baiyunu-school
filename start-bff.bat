@echo off
chcp 65001 >nul
cd /d "%~dp0"
title bynu-bff (@bynu/bff-gateway :3000)
echo [bff] 启动 @bynu/bff-gateway（Fastify/BFF @ 3000）...
call pnpm --filter @bynu/bff-gateway dev
if errorlevel 1 (
  echo [bff] 进程异常退出 errorlevel=%errorlevel%
  pause
  exit /b 1
)
