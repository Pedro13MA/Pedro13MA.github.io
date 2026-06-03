# Instala dependencias do projeto
$NodeDir = "C:\Program Files\nodejs"
if (-not (Test-Path "$NodeDir\npm.cmd")) {
    Write-Host "Node.js nao encontrado. Instala em https://nodejs.org (LTS)." -ForegroundColor Red
    exit 1
}
Set-Location $PSScriptRoot
& "$NodeDir\npm.cmd" install
Write-Host "Concluido. Corre .\dev.ps1 para arrancar o site." -ForegroundColor Green
