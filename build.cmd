@echo off
set "NODE=C:\Program Files\nodejs"
if not exist "%NODE%\npm.cmd" (
  echo Node.js nao encontrado.
  pause
  exit /b 1
)
cd /d "%~dp0"
set "PATH=%NODE%;%PATH%"
call "%NODE%\npm.cmd" run build
echo Build em pasta out\
pause
