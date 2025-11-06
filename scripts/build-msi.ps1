# Complete MSI Build Script for Video Orchestrator
# Builds the complete MSI installer with all dependencies

param(
    [switch]$Release = $false,
    [switch]$Debug = $false,
    [switch]$Clean = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== Video Orchestrator MSI Builder ===" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Clean previous builds
if ($Clean) {
    Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "apps\ui\src-tauri\target") {
        Remove-Item -Recurse -Force "apps\ui\src-tauri\target"
        Write-Host "  ✓ Cleaned Tauri target directory" -ForegroundColor Green
    }
    if (Test-Path "apps\ui\dist") {
        Remove-Item -Recurse -Force "apps\ui\dist"
        Write-Host "  ✓ Cleaned UI dist directory" -ForegroundColor Green
    }
}

# Run preparation script
Write-Host "Running build preparation..." -ForegroundColor Yellow
& "$PSScriptRoot\prepare-msi-build.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build preparation failed" -ForegroundColor Red
    exit 1
}

# Build Tauri app
Write-Host ""
Write-Host "Building Tauri application..." -ForegroundColor Yellow
Set-Location "apps\ui"

if ($Debug) {
    Write-Host "  Building in DEBUG mode..." -ForegroundColor Gray
    pnpm tauri build --debug
} else {
    Write-Host "  Building in RELEASE mode..." -ForegroundColor Gray
    pnpm tauri build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Tauri build failed" -ForegroundColor Red
    Set-Location $ProjectRoot
    exit 1
}

Write-Host "  ✓ Tauri build complete" -ForegroundColor Green

# Find MSI file
$msiPath = "src-tauri\target\release\bundle\msi"
if ($Debug) {
    $msiPath = "src-tauri\target\debug\bundle\msi"
}

if (Test-Path $msiPath) {
    $msiFiles = Get-ChildItem -Path $msiPath -Filter "*.msi"
    if ($msiFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "=== Build Successful ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "MSI Installer created:" -ForegroundColor Cyan
        foreach ($msi in $msiFiles) {
            $fullPath = $msi.FullName
            $size = [math]::Round($msi.Length / 1MB, 2)
            Write-Host "  📦 $($msi.Name) ($size MB)" -ForegroundColor White
            Write-Host "     $fullPath" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "  ⚠ No MSI files found in $msiPath" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ MSI directory not found: $msiPath" -ForegroundColor Yellow
}

Set-Location $ProjectRoot
