# Video Orchestrator - Automatic Tools Installer
# Downloads and sets up FFmpeg, Piper TTS, and Whisper.cpp

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Err { Write-Host $args -ForegroundColor Red }

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host " Video Orchestrator - Tools Installer v1.0" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptPath
$toolsDir = Join-Path $rootDir "tools"

Write-Info "Tools directory: $toolsDir"
Write-Info "This script will download:"
Write-Info "  1. FFmpeg (~120 MB) - Video/audio processing"
Write-Info "  2. Piper TTS (~50 MB) - Text-to-speech"  
Write-Info "  3. Whisper.cpp (~10 MB) - Speech-to-text"
Write-Info "`nTotal download size: ~180 MB"
Write-Info "`nPress any key to continue or Ctrl+C to cancel..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

$tempDir = Join-Path $env:TEMP "video-orchestrator-tools"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null
Write-Info "`nTemp directory: $tempDir`n"

# ============================================================================
# FFMPEG INSTALLATION
# ============================================================================
Write-Host "`n[1/3] Installing FFmpeg..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Yellow

$ffmpegDir = Join-Path $toolsDir "ffmpeg"
$ffmpegExe = Join-Path $ffmpegDir "ffmpeg.exe"

if (Test-Path $ffmpegExe) {
    Write-Warning "FFmpeg already installed at: $ffmpegExe"
    Write-Info "Skipping download."
} else {
    Write-Info "Downloading FFmpeg (Windows build)..."
    
    $ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    $ffmpegZip = Join-Path $tempDir "ffmpeg.zip"
    
    try {
        Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZip -UseBasicParsing
        Write-Success "[OK] Downloaded FFmpeg"
        
        Write-Info "Extracting FFmpeg..."
        Expand-Archive -Path $ffmpegZip -DestinationPath $tempDir -Force
        
        $ffmpegBin = Get-ChildItem -Path $tempDir -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
        
        if ($ffmpegBin) {
            Copy-Item $ffmpegBin.FullName -Destination $ffmpegExe -Force
            
            $ffprobeSrc = Get-ChildItem -Path $tempDir -Filter "ffprobe.exe" -Recurse | Select-Object -First 1
            if ($ffprobeSrc) {
                Copy-Item $ffprobeSrc.FullName -Destination (Join-Path $ffmpegDir "ffprobe.exe") -Force
            }
            
            Write-Success "[OK] FFmpeg installed successfully"
            
            $version = & $ffmpegExe -version 2>&1 | Select-Object -First 1
            Write-Info "Version: $version"
        } else {
            Write-Err "[ERROR] Could not find ffmpeg.exe in downloaded archive"
        }
    } catch {
        Write-Err "[ERROR] Failed to download/install FFmpeg"
        Write-Err $_.Exception.Message
    }
}

# ============================================================================
# PIPER TTS INSTALLATION  
# ============================================================================
Write-Host "`n[2/3] Installing Piper TTS..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Yellow

$piperDir = Join-Path $toolsDir "piper"
$piperExe = Join-Path $piperDir "piper.exe"

if (Test-Path $piperExe) {
    Write-Warning "Piper TTS already installed at: $piperExe"
    Write-Info "Skipping download."
} else {
    Write-Info "Downloading Piper TTS (Windows build)..."
    
    $piperUrl = "https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_windows_amd64.zip"
    $piperZip = Join-Path $tempDir "piper.zip"
    
    try {
        Invoke-WebRequest -Uri $piperUrl -OutFile $piperZip -UseBasicParsing
        Write-Success "[OK] Downloaded Piper TTS"
        
        Write-Info "Extracting Piper TTS..."
        Expand-Archive -Path $piperZip -DestinationPath $tempDir -Force
        
        $piperBin = Get-ChildItem -Path $tempDir -Filter "piper.exe" -Recurse | Select-Object -First 1
        
        if ($piperBin) {
            Copy-Item $piperBin.FullName -Destination $piperExe -Force
            
            $piperDlls = Get-ChildItem -Path $piperBin.Directory -Filter "*.dll"
            foreach ($dll in $piperDlls) {
                Copy-Item $dll.FullName -Destination $piperDir -Force
            }
            
            Write-Success "[OK] Piper TTS installed successfully"
            Write-Info "Note: Voice models need to be downloaded separately"
            Write-Info "See tools/piper/README.md for model downloads"
        } else {
            Write-Err "[ERROR] Could not find piper.exe in downloaded archive"
        }
    } catch {
        Write-Err "[ERROR] Failed to download/install Piper TTS"
        Write-Err $_.Exception.Message
        Write-Warning "Download manually from: https://github.com/rhasspy/piper/releases"
    }
}

# ============================================================================
# WHISPER.CPP INSTALLATION
# ============================================================================
Write-Host "`n[3/3] Installing Whisper.cpp..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Yellow

$whisperDir = Join-Path $toolsDir "whisper"
$whisperExe = Join-Path $whisperDir "main.exe"

if (Test-Path $whisperExe) {
    Write-Warning "Whisper.cpp already installed at: $whisperExe"
    Write-Info "Skipping download."
} else {
    Write-Info "Downloading Whisper.cpp (Windows build)..."
    
    $whisperUrl = "https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.4/whisper-bin-x64.zip"
    $whisperZip = Join-Path $tempDir "whisper.zip"
    
    try {
        Invoke-WebRequest -Uri $whisperUrl -OutFile $whisperZip -UseBasicParsing
        Write-Success "[OK] Downloaded Whisper.cpp"
        
        Write-Info "Extracting Whisper.cpp..."
        Expand-Archive -Path $whisperZip -DestinationPath $tempDir -Force
        
        $whisperBin = Get-ChildItem -Path $tempDir -Filter "main.exe" -Recurse | Select-Object -First 1
        
        if ($whisperBin) {
            Copy-Item $whisperBin.FullName -Destination $whisperExe -Force
            
            $whisperDlls = Get-ChildItem -Path $whisperBin.Directory -Filter "*.dll"
            foreach ($dll in $whisperDlls) {
                Copy-Item $dll.FullName -Destination $whisperDir -Force
            }
            
            Write-Success "[OK] Whisper.cpp installed successfully"
            Write-Info "Note: Language models need to be downloaded separately"
            Write-Info "See tools/whisper/README.md for model downloads"
        } else {
            Write-Err "[ERROR] Could not find main.exe in downloaded archive"
        }
    } catch {
        Write-Err "[ERROR] Failed to download/install Whisper.cpp"
        Write-Err $_.Exception.Message
        Write-Warning "Download manually from: https://github.com/ggerganov/whisper.cpp/releases"
    }
}

# ============================================================================
# CLEANUP AND SUMMARY
# ============================================================================
Write-Host "`n-----------------------------------------------" -ForegroundColor Yellow
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "         Installation Complete!" -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Green

Write-Host "Installation Summary:" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

$installed = @()
$missing = @()

if (Test-Path $ffmpegExe) {
    $installed += "[OK] FFmpeg: $ffmpegExe"
} else {
    $missing += "[MISSING] FFmpeg: Not installed"
}

if (Test-Path $piperExe) {
    $installed += "[OK] Piper TTS: $piperExe"
} else {
    $missing += "[MISSING] Piper TTS: Not installed"
}

if (Test-Path $whisperExe) {
    $installed += "[OK] Whisper.cpp: $whisperExe"
} else {
    $missing += "[MISSING] Whisper.cpp: Not installed"
}

foreach ($item in $installed) {
    Write-Success $item
}

foreach ($item in $missing) {
    Write-Err $item
}

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Yellow
Write-Info "1. Download voice models for Piper TTS"
Write-Info "   See: tools/piper/README.md"
Write-Info ""
Write-Info "2. Download language models for Whisper"
Write-Info "   See: tools/whisper/README.md"
Write-Info ""
Write-Info "3. Configure .env file"
Write-Info "   cd apps/orchestrator"
Write-Info "   cp .env.example .env"
Write-Info ""
Write-Info "4. Test the installation"
Write-Info "   pnpm dev"
Write-Info "   Visit: http://127.0.0.1:4545/health"

Write-Host "`nHappy video creating!`n" -ForegroundColor Magenta
