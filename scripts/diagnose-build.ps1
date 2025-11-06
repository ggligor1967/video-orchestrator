# Build Diagnostics Script - Video Orchestrator
# Created: November 3, 2025
# Purpose: Pre-build diagnostics to verify system readiness

Write-Host "=== BUILD DIAGNOSTICS REPORT ===" -ForegroundColor Cyan
Write-Host "Generated: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# 1. Environment Check
Write-Host "--- Environment ---" -ForegroundColor Yellow
try { 
    $nodeVer = node --version
    Write-Host "Node: $nodeVer" -ForegroundColor Green
} catch { 
    Write-Host "Node: NOT FOUND" -ForegroundColor Red 
}

try { 
    $pnpmVer = pnpm --version
    Write-Host "pnpm: $pnpmVer" -ForegroundColor Green
} catch { 
    Write-Host "pnpm: NOT FOUND" -ForegroundColor Red 
}

try { 
    $rustVer = rustc --version
    Write-Host "Rust: $rustVer" -ForegroundColor Green
} catch { 
    Write-Host "Rust: NOT FOUND" -ForegroundColor Red 
}

try { 
    $cargoVer = cargo --version
    Write-Host "Cargo: $cargoVer" -ForegroundColor Green
} catch { 
    Write-Host "Cargo: NOT FOUND" -ForegroundColor Red 
}

# Check multiple WiX locations
$wixPaths = @(
    "C:\Program Files (x86)\WiX Toolset v3.11\bin\candle.exe",
    "C:\Program Files\WiX Toolset v3.11\bin\candle.exe",
    "d:\playground\Aplicatia\WiX Toolset\extracted\candle.exe"
)

$wixFound = $false
foreach ($wixPath in $wixPaths) {
    if (Test-Path $wixPath) {
        Write-Host "WiX: INSTALLED at $wixPath" -ForegroundColor Green
        $wixVer = & $wixPath -? 2>&1 | Select-Object -First 1
        Write-Host "  Version: $wixVer" -ForegroundColor Gray
        $wixFound = $true
        break
    }
}

if (-not $wixFound) {
    Write-Host "WiX: NOT FOUND" -ForegroundColor Red
    Write-Host "  Check: d:\playground\Aplicatia\WiX Toolset\" -ForegroundColor Yellow
}

# 2. Project Structure
Write-Host "`n--- Project Structure ---" -ForegroundColor Yellow
$criticalDirs = @("apps\ui", "apps\orchestrator", "packages\shared", "tools", "scripts")
$structureOK = $true

foreach ($dir in $criticalDirs) {
    if (Test-Path $dir) {
        $fileCount = (Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "✅ $dir ($fileCount files)" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir MISSING" -ForegroundColor Red
        $structureOK = $false
    }
}

# 3. Tools Verification
Write-Host "`n--- Tools Status ---" -ForegroundColor Yellow
$requiredTools = @{
    "ffmpeg.exe" = 283
    "piper.exe" = 70
    "main.exe" = 50
}

$toolsOK = $true
$toolsFound = 0

foreach ($tool in $requiredTools.Keys) {
    $found = Get-ChildItem "tools" -Recurse -Include $tool -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $sizeMB = [math]::Round($found.Length/1MB, 2)
        $expected = $requiredTools[$tool]
        
        if ($sizeMB -ge ($expected * 0.8)) {
            Write-Host "✅ $tool`: $sizeMB MB (expected ~$expected MB)" -ForegroundColor Green
            $toolsFound++
        } else {
            Write-Host "⚠️ $tool`: $sizeMB MB (expected ~$expected MB) - TOO SMALL" -ForegroundColor Yellow
            $toolsOK = $false
        }
    } else {
        Write-Host "❌ $tool`: NOT FOUND" -ForegroundColor Red
        $toolsOK = $false
    }
}

Write-Host "`nTools found: $toolsFound/$($requiredTools.Count)" -ForegroundColor $(if($toolsFound -eq $requiredTools.Count){'Green'}else{'Yellow'})

# 4. Build Artifacts
Write-Host "`n--- Build Artifacts ---" -ForegroundColor Yellow

# Check frontend dist
$distPath = "apps\ui\dist"
if (Test-Path $distPath) {
    $distSize = [math]::Round((Get-ChildItem $distPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Sum Length).Sum/1MB, 2)
    Write-Host "Frontend dist: $distSize MB" -ForegroundColor $(if($distSize -gt 10){'Green'}elseif($distSize -gt 5){'Yellow'}else{'Red'})
    if ($distSize -lt 10) {
        Write-Host "  ⚠️ Dist size suspicious - may need rebuild" -ForegroundColor Yellow
    }
} else {
    Write-Host "Frontend dist: NOT BUILT" -ForegroundColor Yellow
}

# Check MSI
$msiPath = "apps\ui\src-tauri\target\release\bundle\msi"
if (Test-Path $msiPath) {
    $msi = Get-ChildItem "$msiPath\*.msi" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($msi) {
        $msiSize = [math]::Round($msi.Length/1MB, 2)
        $status = if ($msiSize -ge 350) { "✅ VALID" } elseif ($msiSize -ge 100) { "⚠️ PARTIAL" } else { "❌ STUB" }
        Write-Host "MSI Package: $msiSize MB - $status" -ForegroundColor $(if ($msiSize -ge 350) { "Green" } elseif ($msiSize -ge 100) { "Yellow" } else { "Red" })
        Write-Host "  Path: $($msi.FullName)" -ForegroundColor Gray
        Write-Host "  Modified: $($msi.LastWriteTime)" -ForegroundColor Gray
    } else {
        Write-Host "MSI Package: NOT FOUND in bundle directory" -ForegroundColor Yellow
    }
} else {
    Write-Host "MSI Package: BUILD DIRECTORY MISSING" -ForegroundColor Red
}

# 5. Recent Build Logs
Write-Host "`n--- Build Logs Analysis ---" -ForegroundColor Yellow
$logFiles = @("build.log", "apps\ui\build.log", "tauri-build.log")
$logsFound = $false

foreach ($logFile in $logFiles) {
    if (Test-Path $logFile) {
        $logsFound = $true
        $logSize = [math]::Round((Get-Item $logFile).Length/1KB, 2)
        Write-Host "Found: $logFile ($logSize KB)" -ForegroundColor Cyan
        
        $content = Get-Content $logFile -ErrorAction SilentlyContinue
        $errors = $content | Select-String -Pattern "error|failed" -SimpleMatch
        $exitCodes = $content | Select-String -Pattern "exit code" -SimpleMatch
        
        Write-Host "  Errors found: $($errors.Count)" -ForegroundColor $(if($errors.Count -gt 0){'Red'}else{'Green'})
        
        if ($errors.Count -gt 0 -and $errors.Count -le 5) {
            Write-Host "  Recent errors:" -ForegroundColor Red
            $errors | Select-Object -Last 3 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        } elseif ($errors.Count -gt 5) {
            Write-Host "  (Too many errors to display, showing last 3)" -ForegroundColor Red
            $errors | Select-Object -Last 3 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        }
        
        if ($exitCodes) {
            Write-Host "  Exit codes:" -ForegroundColor Yellow
            $exitCodes | Select-Object -Last 2 | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
        }
    }
}

if (-not $logsFound) {
    Write-Host "No build logs found (no recent builds?)" -ForegroundColor Gray
}

# 6. Dependencies Check
Write-Host "`n--- Dependencies ---" -ForegroundColor Yellow
$nodeModulesChecks = @(
    "node_modules",
    "apps\ui\node_modules",
    "apps\orchestrator\node_modules",
    "packages\shared\node_modules"
)

$depsOK = $true
foreach ($nmPath in $nodeModulesChecks) {
    if (Test-Path $nmPath) {
        $count = (Get-ChildItem $nmPath -Directory -ErrorAction SilentlyContinue).Count
        Write-Host "✅ $nmPath ($count packages)" -ForegroundColor Green
    } else {
        Write-Host "❌ $nmPath MISSING" -ForegroundColor Red
        $depsOK = $false
    }
}

# 7. Final Verdict
Write-Host "`n=== VERDICT ===" -ForegroundColor Cyan
$readyToBuild = $true
$issues = @()

if (-not $toolsOK) { 
    $issues += "Tools incomplete or too small"
    $readyToBuild = $false
}

if (-not $depsOK) {
    $issues += "Dependencies not installed"
    $readyToBuild = $false
}

if (-not $structureOK) {
    $issues += "Project structure incomplete"
    $readyToBuild = $false
}

if (-not (Test-Path $wixPath)) {
    $issues += "WiX Toolset not installed"
    $readyToBuild = $false
}

if ($readyToBuild) {
    Write-Host "✅ System ready for MSI build" -ForegroundColor Green
    Write-Host "`nNext step: Run Phase 1 clean and setup" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ System NOT ready for MSI build" -ForegroundColor Red
    Write-Host "`nIssues found:" -ForegroundColor Yellow
    $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "`nRecommendation: Follow Phase 1 of REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md" -ForegroundColor Cyan
    exit 1
}
