$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$backupDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$file = Join-Path $backupDir "wallace_portfolio-$stamp.sql"
Write-Host "Creating PostgreSQL backup: $file"
docker compose exec -T db pg_dump -U wallace -d wallace_portfolio --clean --if-exists > $file
if ($LASTEXITCODE -ne 0) { throw "Backup failed." }
Write-Host "Backup completed successfully."
