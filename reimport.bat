@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo =====================================
echo [reimport] 清空本地数据（sqlite / pglite）
echo =====================================
echo 将清理以下目录中的所有数据文件：
echo   - apps\server\.data
echo   - apps\bff-gateway\.data
echo.

set /p confirm=确认继续？输入 Y 继续，其他键取消: 
if /i not "%confirm%"=="Y" (
  echo 已取消
  endlocal
  exit /b 0
)

echo [1/2] 尝试释放可能占用数据文件的服务进程 ...
for %%P in (3000 3001) do call :KILL_PORT %%P

echo [2/2] 清理数据文件 ...
for %%D in ("apps\server\.data" "apps\bff-gateway\.data") do (
  set "TARGET=%ROOT%%%~D"
  if exist "!TARGET!" (
    echo 清理目录 %%~D ...
    del /f /q /s "!TARGET!\*.sqlite"  >nul 2>&1
    del /f /q /s "!TARGET!\*.sqlite3" >nul 2>&1
    del /f /q /s "!TARGET!\*.db"      >nul 2>&1
    del /f /q /s "!TARGET!\*.pglite"  >nul 2>&1
    del /f /q /s "!TARGET!\*.wal"     >nul 2>&1
    del /f /q /s "!TARGET!\*.shm"     >nul 2>&1
    for /d %%S in ("!TARGET!\*") do rmdir /s /q "%%S" 2>nul
  ) else (
    echo 目录不存在，跳过 %%~D
  )
)

echo =====================================
echo [reimport] 数据清理完成
echo =====================================
endlocal
pause
exit /b 0

:KILL_PORT
set "PORT=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  echo   端口 %PORT% 被进程 %%a 占用，正在结束 ...
  taskkill /PID %%a /F >nul 2>&1
)
goto :eof
