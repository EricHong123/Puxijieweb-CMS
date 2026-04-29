@echo off
setlocal
cd /d "%~dp0"

REM One-click start for Windows
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-web.ps1"

endlocal
