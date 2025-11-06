# Video Orchestrator - Tools Verification Script
# Checks if all external tools are installed correctly

$ErrorActionPreference = "Continue"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Err { Write-Host $args -ForegroundColor Red }

Write-Host "`n" -NoNewline
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Video Orchestrator - Tools Verification" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptPath  # Go up one level from scripts/ to project root
$toolsDir = Join-Path $rootDir "tools"

$allGood = $true

# ============================================================================
# CHECK FFMPEG
# ============================================================================
Write-Info "[1/4] Checking FFmpeg..."
Write-Host "-----------------------------------------------" -ForegroundColor DarkGray

$ffmpegExe = Join-Path $toolsDir "ffmpeg\ffmpeg.exe"
$ffprobeExe = Join-Path $toolsDir "ffmpeg\ffprobe.exe"

if (Test-Path $ffmpegExe) {
    Write-Success "  [OK] ffmpeg.exe found"
    
    try {
        $version = & $ffmpegExe -version 2>&1 | Select-Object -First 1
        Write-Info "       Version: $version"
        
        # Test with a simple command
        $testResult = & $ffmpegExe -formats 2>&1 | Select-String "mp4" | Select-Object -First 1
        if ($testResult) {
            Write-Success "  [OK] FFmpeg is functional"
        }
    } catch {
        Write-Err "  [ERROR] FFmpeg found but not working: $($_.Exception.Message)"
        $allGood = $false
    }
} else {
    Write-Err "  [MISSING] ffmpeg.exe not found at: $ffmpegExe"
    Write-Warning "       Download from: https://www.gyan.dev/ffmpeg/builds/"
    $allGood = $false
}

if (Test-Path $ffprobeExe) {
    Write-Success "  [OK] ffprobe.exe found"
} else {
    Write-Warning "  [MISSING] ffprobe.exe not found (optional but recommended)"
}

# ============================================================================
# CHECK PIPER TTS
# ============================================================================
Write-Host ""
Write-Info "[2/4] Checking Piper TTS..."
Write-Host "-----------------------------------------------" -ForegroundColor DarkGray

$piperExe = Join-Path $toolsDir "piper\piper.exe"
$piperModels = Join-Path $toolsDir "piper\models"
$espeak = Join-Path $toolsDir "piper\espeak-ng-data"

if (Test-Path $piperExe) {
    Write-Success "  [OK] piper.exe found"
    
    # Check for espeak-ng-data
    if (Test-Path $espeak) {
        Write-Success "  [OK] espeak-ng-data folder found"
    } else {
        Write-Err "  [MISSING] espeak-ng-data folder not found"
        Write-Warning "       This folder should be in the same directory as piper.exe"
        $allGood = $false
    }
    
    # Check for DLL files
    $dlls = Get-ChildItem (Join-Path $toolsDir "piper") -Filter "*.dll" -ErrorAction SilentlyContinue
    if ($dlls.Count -gt 0) {
        Write-Success "  [OK] Found $($dlls.Count) DLL file(s)"
    } else {
        Write-Warning "  [WARNING] No DLL files found (might cause errors)"
    }
    
    # Check for voice models
    if (Test-Path $piperModels) {
        $models = Get-ChildItem $piperModels -Filter "*.onnx" -ErrorAction SilentlyContinue
        
        if ($models.Count -gt 0) {
            Write-Success "  [OK] Found $($models.Count) voice model(s):"
            foreach ($model in $models) {
                $size = [math]::Round($model.Length / 1MB, 1)
                Write-Info "       - $($model.Name) ($size MB)"
                
                # Check for corresponding .json config
                $jsonConfig = $model.FullName + ".json"
                if (Test-Path $jsonConfig) {
                    Write-Success "         [OK] Config file found"
                } else {
                    Write-Warning "         [MISSING] Config file: $($model.Name).json"
                }
            }
        } else {
            Write-Err "  [MISSING] No voice models found in: $piperModels"
            Write-Warning "       Download from: https://huggingface.co/rhasspy/piper-voices"
            Write-Info "       Recommended: en_US-amy-medium.onnx"
            $allGood = $false
        }
    } else {
        Write-Err "  [MISSING] Models folder not found: $piperModels"
        Write-Warning "       Create folder and download voice models"
        $allGood = $false
    }
} else {
    Write-Err "  [MISSING] piper.exe not found at: $piperExe"
    Write-Warning "       Download from: https://github.com/rhasspy/piper/releases"
    $allGood = $false
}

# ============================================================================
# CHECK WHISPER.CPP
# ============================================================================
Write-Host ""
Write-Info "[3/4] Checking Whisper.cpp..."
Write-Host "-----------------------------------------------" -ForegroundColor DarkGray

$whisperExe = Join-Path $toolsDir "whisper\main.exe"
$whisperModels = Join-Path $toolsDir "whisper\models"

if (Test-Path $whisperExe) {
    Write-Success "  [OK] main.exe found"
    
    # Check for language models
    if (Test-Path $whisperModels) {
        $models = Get-ChildItem $whisperModels -Filter "*.bin" -ErrorAction SilentlyContinue
        
        if ($models.Count -gt 0) {
            Write-Success "  [OK] Found $($models.Count) language model(s):"
            foreach ($model in $models) {
                $size = [math]::Round($model.Length / 1MB, 1)
                Write-Info "       - $($model.Name) ($size MB)"
            }
            
            # Recommend base.en if not found
            $hasBase = $models | Where-Object { $_.Name -like "*base.en*" }
            if (-not $hasBase) {
                Write-Info "       Note: base.en model recommended for best balance"
            }
        } else {
            Write-Err "  [MISSING] No language models found in: $whisperModels"
            Write-Warning "       Download from: https://huggingface.co/ggerganov/whisper.cpp"
            Write-Info "       Recommended: ggml-base.en.bin"
            $allGood = $false
        }
    } else {
        Write-Err "  [MISSING] Models folder not found: $whisperModels"
        Write-Warning "       Create folder and download language models"
        $allGood = $false
    }
} else {
    Write-Err "  [MISSING] main.exe not found at: $whisperExe"
    Write-Warning "       Download from: https://github.com/ggerganov/whisper.cpp/releases"
    $allGood = $false
}

# ============================================================================
# CHECK GODOT (OPTIONAL)
# ============================================================================
Write-Host ""
Write-Info "[4/4] Checking Godot Engine (optional)..."
Write-Host "-----------------------------------------------" -ForegroundColor DarkGray

$godotExe = Get-ChildItem (Join-Path $toolsDir "godot") -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($godotExe) {
    Write-Success "  [OK] Godot Engine found: $($godotExe.Name)"
} else {
    Write-Info "  [SKIP] Godot Engine not installed (optional)"
    Write-Info "       Only needed for custom voxel background generation"
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "                  SUMMARY" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$summary = @{
    "FFmpeg" = Test-Path $ffmpegExe
    "Piper TTS" = Test-Path $piperExe
    "Whisper.cpp" = Test-Path $whisperExe
    "Godot" = $null -ne $godotExe
}

$installed = 0
$total = 3  # Exclude optional Godot

foreach ($tool in $summary.Keys) {
    if ($tool -eq "Godot") { continue }  # Skip optional
    
    if ($summary[$tool]) {
        Write-Success "  [OK] $tool"
        $installed++
    } else {
        Write-Err "  [MISSING] $tool"
    }
}

if ($summary["Godot"]) {
    Write-Success "  [OK] Godot (optional)"
} else {
    Write-Info "  [SKIP] Godot (optional)"
}

Write-Host ""
Write-Host "Installation Status: $installed / $total required tools" -ForegroundColor $(if ($installed -eq $total) { "Green" } else { "Yellow" })

if ($allGood -and $installed -eq $total) {
    Write-Host ""
    Write-Success "================================================="
    Write-Success "  All required tools are installed correctly!"
    Write-Success "  You're ready to start Video Orchestrator!"
    Write-Success "================================================="
    Write-Host ""
    Write-Info "Next steps:"
    Write-Info "  1. Start the server:"
    Write-Info "     cd apps\orchestrator"
    Write-Info "     pnpm dev"
    Write-Info ""
    Write-Info "  2. Check health endpoint:"
    Write-Info "     http://127.0.0.1:4545/health"
    Write-Info ""
    Write-Info "  3. Start the UI:"
    Write-Info "     cd apps\ui"
    Write-Info "     pnpm dev"
} else {
    Write-Host ""
    Write-Warning "================================================="
    Write-Warning "  Some tools are missing or not configured!"
    Write-Warning "================================================="
    Write-Host ""
    Write-Info "Please refer to:"
    Write-Info "  MANUAL_INSTALLATION_GUIDE.md"
    Write-Host ""
    Write-Info "Or download tools manually:"
    Write-Info "  - FFmpeg: https://www.gyan.dev/ffmpeg/builds/"
    Write-Info "  - Piper TTS: https://github.com/rhasspy/piper/releases"
    Write-Info "  - Whisper.cpp: https://github.com/ggerganov/whisper.cpp/releases"
}

Write-Host ""
