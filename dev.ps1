# Arranca o site em desenvolvimento (não precisa de npm no PATH)
$NodeDir = "C:\Program Files\nodejs"
if (-not (Test-Path "$NodeDir\npm.cmd")) {
    Write-Host "Node.js nao encontrado. Instala em https://nodejs.org (LTS) e reinicia o PC." -ForegroundColor Red
    exit 1
}
$env:Path = "$NodeDir;" + [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Set-Location $PSScriptRoot
if (-not (Test-Path "node_modules")) {
    Write-Host "A instalar dependencias..." -ForegroundColor Cyan
    & "$NodeDir\npm.cmd" install
}
Write-Host "Servidor em http://localhost:3000" -ForegroundColor Green
& "$NodeDir\npm.cmd" run dev
