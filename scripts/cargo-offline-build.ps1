# Cargo Offline Build Script
# Remediază blocajele de rețea pentru MSI packaging prin:
# 1. Pre-download dependencies în vendor/
# 2. Configurare offline build
# 3. Retry logic pentru operațiuni de rețea

param(
    [switch]$PrepareVendor,
    [switch]$BuildOffline,
    [switch]$FullBuild
)

$ErrorActionPreference = "Continue"
$projectRoot = "d:\playground\Aplicatia"
$tauriRoot = "$projectRoot\apps\ui\src-tauri"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Cargo Offline Build - MSI Packaging Helper            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

function Test-NetworkConnection {
    Write-Host "`n🌐 Testing network connectivity..." -ForegroundColor Yellow
    
    $crates = @("https://crates.io", "https://static.crates.io")
    $reachable = $false
    
    foreach ($url in $crates) {
        try {
            $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            Write-Host "  ✅ $url - OK" -ForegroundColor Green
            $reachable = $true
        } catch {
            Write-Host "  ❌ $url - FAILED" -ForegroundColor Red
        }
    }
    
    return $reachable
}

function Invoke-CargoWithRetry {
    param(
        [string]$Command,
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 5
    )
    
    $attempt = 0
    $success = $false
    
    while (-not $success -and $attempt -lt $MaxRetries) {
        $attempt++
        Write-Host "`n🔄 Attempt $attempt of $MaxRetries..." -ForegroundColor Cyan
        
        try {
            Invoke-Expression $Command
            if ($LASTEXITCODE -eq 0) {
                $success = $true
                Write-Host "✅ Command succeeded!" -ForegroundColor Green
            } else {
                throw "Command failed with exit code $LASTEXITCODE"
            }
        } catch {
            Write-Host "❌ Attempt $attempt failed: $_" -ForegroundColor Red
            if ($attempt -lt $MaxRetries) {
                Write-Host "⏳ Waiting $RetryDelay seconds before retry..." -ForegroundColor Yellow
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    
    return $success
}

function Prepare-VendorDependencies {
    Write-Host "`n📦 Preparing vendor dependencies..." -ForegroundColor Cyan
    
    Set-Location $tauriRoot
    
    # Verifică dacă Cargo.lock există
    if (-not (Test-Path "Cargo.lock")) {
        Write-Host "⚠️  Cargo.lock not found. Generating..." -ForegroundColor Yellow
        cargo generate-lockfile
    }
    
    # Testează conectivitatea
    $networkOk = Test-NetworkConnection
    
    if (-not $networkOk) {
        Write-Host "`n⚠️  Network issues detected. Attempting offline build..." -ForegroundColor Yellow
        return $false
    }
    
    # Download dependencies cu retry
    Write-Host "`n📥 Downloading dependencies..." -ForegroundColor Cyan
    $success = Invoke-CargoWithRetry -Command "cargo fetch --locked"
    
    if ($success) {
        # Vendor dependencies pentru complete offline build
        Write-Host "`n📦 Creating vendor directory..." -ForegroundColor Cyan
        if (Test-Path "vendor") {
            Remove-Item -Recurse -Force "vendor"
        }
        
        cargo vendor vendor 2>&1 | Tee-Object -Variable vendorOutput
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Vendor directory created successfully" -ForegroundColor Green
            
            # Configurare .cargo/config.toml pentru offline
            $cargoConfigDir = ".cargo"
            if (-not (Test-Path $cargoConfigDir)) {
                New-Item -ItemType Directory -Path $cargoConfigDir | Out-Null
            }
            
            $configContent = @"
[source.crates-io]
replace-with = "vendored-sources"

[source.vendored-sources]
directory = "vendor"

[net]
offline = true
"@
            Set-Content -Path "$cargoConfigDir\config.toml" -Value $configContent
            Write-Host "✅ Offline config created at .cargo/config.toml" -ForegroundColor Green
            
            return $true
        } else {
            Write-Host "❌ Failed to create vendor directory" -ForegroundColor Red
            return $false
        }
    }
    
    return $false
}

function Build-TauriOffline {
    Write-Host "`n🔨 Building Tauri with offline mode..." -ForegroundColor Cyan
    
    Set-Location $tauriRoot
    
    # Verifică dacă vendor există
    if (Test-Path "vendor") {
        Write-Host "✅ Using vendored dependencies" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No vendor directory. Attempting online build..." -ForegroundColor Yellow
    }
    
    # Curăță target anterior pentru build curat
    Write-Host "`n🧹 Cleaning previous build..." -ForegroundColor Yellow
    if (Test-Path "target\release\bundle\msi") {
        Remove-Item -Recurse -Force "target\release\bundle\msi"
    }
    
    # Build cu retry
    Write-Host "`n🚀 Starting Tauri build..." -ForegroundColor Cyan
    Set-Location $projectRoot
    
    $buildCmd = "pnpm --filter @app/ui tauri build"
    $success = Invoke-CargoWithRetry -Command $buildCmd -MaxRetries 3 -RetryDelay 10
    
    if ($success) {
        Write-Host "`n✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        
        # Verifică MSI
        $msiPath = "$tauriRoot\target\release\bundle\msi"
        if (Test-Path $msiPath) {
            $msiFiles = Get-ChildItem "$msiPath\*.msi"
            if ($msiFiles) {
                Write-Host "`n📦 MSI Packages created:" -ForegroundColor Green
                foreach ($msi in $msiFiles) {
                    $sizeMB = [math]::Round($msi.Length / 1MB, 2)
                    Write-Host "  📄 $($msi.Name) - $sizeMB MB" -ForegroundColor Cyan
                }
            }
        }
    } else {
        Write-Host "`n❌ BUILD FAILED after all retries" -ForegroundColor Red
    }
    
    return $success
}

function Show-Help {
    Write-Host @"

USAGE:
    .\cargo-offline-build.ps1 [-PrepareVendor] [-BuildOffline] [-FullBuild]

OPTIONS:
    -PrepareVendor    Download and vendor all dependencies (requires network)
    -BuildOffline     Build Tauri MSI using offline/cached dependencies
    -FullBuild        Complete workflow: prepare + build

EXAMPLES:
    # Full workflow (recommended)
    .\cargo-offline-build.ps1 -FullBuild
    
    # Just prepare dependencies (when network is good)
    .\cargo-offline-build.ps1 -PrepareVendor
    
    # Just build (when offline or network issues)
    .\cargo-offline-build.ps1 -BuildOffline

"@ -ForegroundColor Gray
}

# Main execution
if (-not $PrepareVendor -and -not $BuildOffline -and -not $FullBuild) {
    Show-Help
    exit 0
}

if ($PrepareVendor -or $FullBuild) {
    $vendorOk = Prepare-VendorDependencies
    if (-not $vendorOk) {
        Write-Host "`n⚠️  Vendor preparation had issues. Proceeding with standard build..." -ForegroundColor Yellow
    }
}

if ($BuildOffline -or $FullBuild) {
    $buildOk = Build-TauriOffline
    
    if ($buildOk) {
        Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                  ✅ MSI BUILD COMPLETE!                        ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
        Write-Host "║                  ❌ BUILD FAILED                               ║" -ForegroundColor Red
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
        exit 1
    }
}
