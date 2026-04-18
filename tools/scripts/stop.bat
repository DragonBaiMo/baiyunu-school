@echo off
chcp 65001 > nul
cd /d "%~dp0..\.."

echo [停止] 关闭 4 个开发进程窗口...
taskkill /FI "WINDOWTITLE eq 白云·后端*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq 白云·BFF*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq 白云·管理端*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq 白云·H5端*" /F > nul 2>&1

echo [停止] 已停止全部开发进程。
