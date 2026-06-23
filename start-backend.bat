@echo off
title MyBlog Backend Server
cd /d "%~dp0\server"

:loop
echo =========================================
echo Starting backend server...
echo =========================================
call npm.cmd start

echo.
echo =========================================
echo Backend crashed or stopped! 
echo Restarting in 3 seconds...
echo =========================================
timeout /t 3 /nobreak >nul
goto loop
