@echo off
title Celia - NAS Discovery
color 0A
echo.
echo  ==========================================
echo     Celia - NAS Server Discovery Tool
echo  ==========================================
echo.

set /p "HOST=  Enter NAS server IP (e.g. 192.168.1.104): "

if "%HOST%"=="" (
    echo  No IP entered. Exiting.
    pause
    exit /b 1
)

echo.
npx tsx "%~dp0scripts\add-server.ts" %HOST%
echo.
pause
