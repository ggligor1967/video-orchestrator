# Diagnose Build Script

# This script is designed to diagnose build issues in the Video Orchestrator project.

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Warning-Custom { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  DIAGNOSE BUILD SCRIPT                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check for required tools
$requiredTools = @("git", "pnpm", "node", "rustc")
foreach ($tool in $requiredTools) {
    Write-Info "Checking for $tool..."
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "$tool is not installed!"
    } else {
        Write-Success "$tool is installed."
    }
}

# Check for build logs
$buildLogPath = "build.log"
if (-not (Test-Path $buildLogPath)) {
    Write-Warning-Custom "Build log not found: $buildLogPath"
} else {
    Write-Info "Build log found: $buildLogPath"
    Write-Host "Last 20 lines of build log:" -ForegroundColor Cyan
    Get-Content $buildLogPath -Tail 20 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
}

# Check for .gitignore
if (-not (Test-Path ".gitignore")) {
    Write-Warning-Custom ".gitignore file is missing!"
}

# Check for node_modules
if (-not (Test-Path "node_modules")) {
    Write-Warning-Custom "node_modules directory is missing! Run 'pnpm install' to install dependencies."
}

# Check for build artifacts
$buildArtifacts = @("dist", "build", "target")
foreach ($artifact in $buildArtifacts) {
    if (-not (Test-Path $artifact)) {
        Write-Warning-Custom "$artifact directory is missing!"
    } else {
        Write-Success "$artifact directory exists."
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  DIAGNOSIS COMPLETE                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green