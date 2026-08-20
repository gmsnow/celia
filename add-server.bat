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

set /p "USER=  Username (leave blank for no auth): "

if "%USER%"=="" (
    cd /d "%~dp0"
    echo  Running discovery for %HOST% (no auth) ...
    echo.
    call npx tsx scripts/add-server.ts %HOST%
) else (
    set /p "PASS=  Password: "
    cd /d "%~dp0"
    echo  Running discovery for %HOST% as %USER% ...
    echo.
    call npx tsx scripts/add-server.ts %HOST% %USER% %PASS%
)

echo.
echo  ==========================================
echo  Press any key to exit...
echo  ==========================================
pause >nul
