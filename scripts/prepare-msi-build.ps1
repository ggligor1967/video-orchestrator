# MSI Build Preparation Script for Video Orchestrator
# This script prepares the environment for Tauri MSI build

param(
    [switch]$SkipTools = $false,
    [switch]$SkipBackend = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== Video Orchestrator MSI Build Preparation ===" -ForegroundColor Cyan
Write-Host ""

# Get project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# 1. Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✓ pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check Rust
try {
    $rustVersion = rustc --version
    Write-Host "  ✓ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Rust not found. Please install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# 2. Install dependencies
Write-Host ""
Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

# 3. Build shared package
Write-Host ""
Write-Host "[3/6] Building shared package..." -ForegroundColor Yellow
pnpm --filter @video-orchestrator/shared build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to build shared package" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Shared package built" -ForegroundColor Green

# 4. Build backend (optional - for bundling)
if (-not $SkipBackend) {
    Write-Host ""
    Write-Host "[4/6] Building backend..." -ForegroundColor Yellow
    pnpm --filter @app/orchestrator build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to build backend" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Backend built" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[4/6] Skipping backend build" -ForegroundColor Gray
}

# 5. Verify tools (optional)
if (-not $SkipTools) {
    Write-Host ""
    Write-Host "[5/6] Verifying external tools..." -ForegroundColor Yellow
    
    $toolsDir = Join-Path $ProjectRoot "tools"
    $requiredTools = @(
        @{Name="FFmpeg"; Path="ffmpeg\ffmpeg.exe"},
        @{Name="FFprobe"; Path="ffmpeg\ffprobe.exe"},
        @{Name="Piper"; Path="piper\piper.exe"}
    )
    
    $missingTools = @()
    foreach ($tool in $requiredTools) {
        $toolPath = Join-Path $toolsDir $tool.Path
        if (Test-Path $toolPath) {
            Write-Host "  ✓ $($tool.Name) found" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($tool.Name) not found at $toolPath" -ForegroundColor Red
            $missingTools += $tool.Name
        }
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Host ""
        Write-Host "Missing tools: $($missingTools -join ', ')" -ForegroundColor Red
        Write-Host "Please run: pnpm run setup:tools" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "[5/6] Skipping tools verification" -ForegroundColor Gray
}

# 6. Build frontend
Write-Host ""
Write-Host "[6/6] Building frontend..." -ForegroundColor Yellow
pnpm --filter @app/ui build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to build frontend" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Frontend built" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=== Build Preparation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: cd apps\ui" -ForegroundColor White
Write-Host "  2. Run: pnpm tauri build" -ForegroundColor White
Write-Host ""
Write-Host "MSI installer will be created in:" -ForegroundColor Cyan
Write-Host "  apps\ui\src-tauri\target\release\bundle\msi\" -ForegroundColor White
Write-Host ""
