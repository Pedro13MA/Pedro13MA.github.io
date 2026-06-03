@echo off
title Spotter - Servidor local
set "NODE=C:\Program Files\nodejs"
if not exist "%NODE%\node.exe" (
  echo.
  echo [ERRO] Node.js nao esta em %NODE%
  echo Instala: https://nodejs.org  ^(versao LTS^)
  echo Depois reinicia o PC e volta a correr este ficheiro.
  echo.
  pause
  exit /b 1
)
cd /d "%~dp0"
set "PATH=%NODE%;%PATH%"
if not exist "node_modules\" (
  echo A instalar dependencias...
  call "%NODE%\npm.cmd" install
  if errorlevel 1 goto :fail
)
echo.
echo ========================================
echo   Spotter - http://localhost:3000
echo   Para parar: Ctrl+C
echo ========================================
echo.
call "%NODE%\npm.cmd" run dev
goto :end
:fail
echo Falhou. Verifica Node.js.
pause
exit /b 1
:end
