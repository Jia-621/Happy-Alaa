@echo off
chcp 65001 >nul
title Happy Alaa - 桌面版
echo.
echo   🎀 Happy Alaa 桌面版
echo   ════════════════════
echo.
cd /d "%~dp0"
echo   正在启动...
echo.
call npm start
pause
