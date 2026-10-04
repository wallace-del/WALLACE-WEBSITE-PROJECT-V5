param([Parameter(Mandatory=$true)][string]$BackupFile)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$resolved = Resolve-Path $BackupFile
Write-Host "WARNING: This will replace current database objects using: $resolved"
$answer = Read-Host "Type RESTORE to continue"
if ($answer -ne "RESTORE") { Write-Host "Cancelled."; exit 0 }
Get-Content -Raw $resolved | docker compose exec -T db psql -U wallace -d wallace_portfolio
if ($LASTEXITCODE -ne 0) { throw "Restore failed." }
Write-Host "Restore completed successfully."
