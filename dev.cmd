@echo off
set "NODE=C:\Program Files\nodejs"
if not exist "%NODE%\node.exe" (
  echo Node.js nao encontrado. Instala em https://nodejs.org ^(LTS^) e reinicia o PC.
  pause
  exit /b 1
)
cd /d "%~dp0"
rem OBRIGATORIO: node tem de estar no PATH para "npm run dev" funcionar
set "PATH=%NODE%;%PATH%"
if not exist "node_modules\" (
  echo A instalar dependencias...
  call "%NODE%\npm.cmd" install
)
echo.
echo Servidor: http://localhost:3000
echo Para parar: Ctrl+C
echo.
call "%NODE%\npm.cmd" run dev
