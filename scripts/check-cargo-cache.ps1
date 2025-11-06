# Cargo Cache Diagnostic

$ErrorActionPreference = "Continue"
Write-Host "`n=== Cargo Cache Diagnostic ===" -ForegroundColor Cyan

# Check Cargo
try {
    $v = cargo --version
    Write-Host "[OK] $v" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cargo not found" -ForegroundColor Red
    exit 1
}

# Check cache
$cache = if ($env:CARGO_HOME) { $env:CARGO_HOME } else { "$env:USERPROFILE\.cargo" }
Write-Host "`nCache: $cache"
if (Test-Path $cache) { Write-Host "[OK] Exists" -ForegroundColor Green }

# Check project
$proj = "d:\playground\Aplicatia\apps\ui\src-tauri"
if (Test-Path "$proj\Cargo.lock") { Write-Host "[OK] Cargo.lock found" -ForegroundColor Green }
if (Test-Path "$proj\target") { Write-Host "[OK] Target directory found" -ForegroundColor Green }

# Check MSI
$msi = "$proj\target\release\bundle\msi"
if (Test-Path $msi) {
    $files = Get-ChildItem "$msi\*.msi" -ErrorAction SilentlyContinue
    if ($files) {
        Write-Host "`n[OK] MSI packages:" -ForegroundColor Green
        $files | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Cyan }
    }
}

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Green
