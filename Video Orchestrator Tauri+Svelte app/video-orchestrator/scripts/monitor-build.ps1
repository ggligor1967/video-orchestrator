# PowerShell script to monitor the build process

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  MONITOR BUILD SCRIPT                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Monitor build logs
$logFilePath = "build.log"
$lastReadLine = 0

if (-not (Test-Path $logFilePath)) {
    Write-Error-Custom "Log file not found: $logFilePath"
    exit 1
}

Write-Info "Monitoring build log: $logFilePath"

while ($true) {
    $lines = Get-Content $logFilePath -Tail 10 -ReadCount 0
    if ($lines.Count -gt 0) {
        foreach ($line in $lines) {
            Write-Host $line -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 5
}