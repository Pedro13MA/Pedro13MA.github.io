@echo off
set "NODE=C:\Program Files\nodejs"
if not exist "%NODE%\npm.cmd" (
  echo Node.js nao encontrado. Instala em https://nodejs.org ^(LTS^) e reinicia o PC.
  pause
  exit /b 1
)
cd /d "%~dp0"
set "PATH=%NODE%;%PATH%"
echo A instalar dependencias...
call "%NODE%\npm.cmd" install
if errorlevel 1 (
  echo Falhou.
  pause
  exit /b 1
)
echo.
echo Concluido. Corre dev.cmd para arrancar o site.
pause
