@echo off
chcp 65001 > nul
cd /d "%~dp0..\.."

echo.
echo [重置] 将重置本地 PGlite 数据库并重建种子数据
set /p confirm=继续吗? (Y/N):
if /I not "%confirm%"=="Y" (
  echo [重置] 已取消。
  exit /b 0
)

if exist ".data\pg" (
  echo [重置] 删除 .data\pg ...
  rmdir /s /q ".data\pg"
)

echo [重置] 执行种子脚本（@bynu/db seed）...
call pnpm -F @bynu/db run seed
if errorlevel 1 (
  echo [错误] 种子导入失败。
  pause
  exit /b 1
)

echo [重置] 完成，已注入 5 位合成校友。
