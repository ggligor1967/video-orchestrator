# Fix MSI Build Issues
Write-Host "🔧 Fixing MSI Build Configuration..." -ForegroundColor Cyan

# 1. Clean previous builds
Write-Host "`n1. Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "apps\ui\src-tauri\target") {
    Remove-Item -Path "apps\ui\src-tauri\target" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Cleaned target directory" -ForegroundColor Green
}

# 2. Check Rust installation
Write-Host "`n2. Checking Rust installation..." -ForegroundColor Yellow
$rustVersion = rustc --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Rust installed: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ Rust not found. Install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# 3. Check WiX Toolset
Write-Host "`n3. Checking WiX Toolset..." -ForegroundColor Yellow
$wixPath = Get-Command candle.exe -ErrorAction SilentlyContinue
if ($wixPath) {
    Write-Host "   ✓ WiX Toolset found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ WiX Toolset not found. Installing..." -ForegroundColor Yellow
    winget install --id WiX.Toolset --silent --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ WiX Toolset installed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to install WiX. Install manually from https://wixtoolset.org/" -ForegroundColor Red
    }
}

# 4. Update Rust toolchain
Write-Host "`n4. Updating Rust toolchain..." -ForegroundColor Yellow
rustup update stable
rustup default stable
Write-Host "   ✓ Rust toolchain updated" -ForegroundColor Green

# 5. Add Windows target
Write-Host "`n5. Adding Windows target..." -ForegroundColor Yellow
rustup target add x86_64-pc-windows-msvc
Write-Host "   ✓ Windows target added" -ForegroundColor Green

# 6. Install Tauri CLI
Write-Host "`n6. Checking Tauri CLI..." -ForegroundColor Yellow
$tauriVersion = cargo tauri --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Tauri CLI installed: $tauriVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Installing Tauri CLI..." -ForegroundColor Yellow
    cargo install tauri-cli --version "^1.0"
    Write-Host "   ✓ Tauri CLI installed" -ForegroundColor Green
}

# 7. Build frontend
Write-Host "`n7. Building frontend..." -ForegroundColor Yellow
Set-Location "apps\ui"
pnpm build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend build failed" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}
Set-Location "..\..\"

Write-Host "`n✅ MSI build configuration fixed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Run: pnpm --filter @app/ui tauri build" -ForegroundColor White
Write-Host "  2. MSI will be in: apps\ui\src-tauri\target\release\bundle\msi\" -ForegroundColor White
