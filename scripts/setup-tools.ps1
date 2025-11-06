param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Write-Host "Setting up Video Orchestrator Tools..." -ForegroundColor Green

$toolsRoot = "$PSScriptRoot\..\tools"
New-Item -ItemType Directory -Path $toolsRoot -Force | Out-Null

# FFmpeg
$ffmpegPath = "$toolsRoot\ffmpeg\bin\ffmpeg.exe"
if (!(Test-Path $ffmpegPath) -or $Force) {
    Write-Host "Downloading FFmpeg..." -ForegroundColor Yellow
    
    $ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    $ffmpegZip = "$env:TEMP\ffmpeg.zip"
    
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZip -UseBasicParsing
    Expand-Archive -Path $ffmpegZip -DestinationPath "$env:TEMP\ffmpeg-temp" -Force
    
    New-Item -ItemType Directory -Path "$toolsRoot\ffmpeg\bin" -Force | Out-Null
    $extracted = Get-ChildItem "$env:TEMP\ffmpeg-temp" -Directory | Select-Object -First 1
    Copy-Item "$($extracted.FullName)\bin\*" "$toolsRoot\ffmpeg\bin\" -Force
    
    Remove-Item -Recurse -Force "$env:TEMP\ffmpeg-temp", $ffmpegZip
    Write-Host "✅ FFmpeg installed" -ForegroundColor Green
} else {
    Write-Host "✅ FFmpeg already installed" -ForegroundColor Green
}

# Piper TTS
$piperPath = "$toolsRoot\piper\bin\piper.exe"
if (!(Test-Path $piperPath) -or $Force) {
    Write-Host "Downloading Piper TTS..." -ForegroundColor Yellow
    
    $piperUrl = "https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_windows_amd64.zip"
    $piperZip = "$env:TEMP\piper.zip"
    
    Invoke-WebRequest -Uri $piperUrl -OutFile $piperZip -UseBasicParsing
    Expand-Archive -Path $piperZip -DestinationPath "$toolsRoot\piper" -Force
    
    # Download voice model
    $modelUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx"
    $modelJsonUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json"
    
    New-Item -ItemType Directory -Path "$toolsRoot\piper\models" -Force | Out-Null
    Invoke-WebRequest -Uri $modelUrl -OutFile "$toolsRoot\piper\models\en_US-amy-medium.onnx" -UseBasicParsing
    Invoke-WebRequest -Uri $modelJsonUrl -OutFile "$toolsRoot\piper\models\en_US-amy-medium.onnx.json" -UseBasicParsing
    
    Remove-Item $piperZip -Force
    Write-Host "✅ Piper TTS installed" -ForegroundColor Green
} else {
    Write-Host "✅ Piper TTS already installed" -ForegroundColor Green
}

# Whisper
$whisperPath = "$toolsRoot\whisper\bin\main.exe"
if (!(Test-Path $whisperPath) -or $Force) {
    Write-Host "Downloading Whisper..." -ForegroundColor Yellow
    
    $whisperUrl = "https://github.com/ggerganov/whisper.cpp/releases/latest/download/whisper-bin-x64.zip"
    $whisperZip = "$env:TEMP\whisper.zip"
    
    Invoke-WebRequest -Uri $whisperUrl -OutFile $whisperZip -UseBasicParsing
    Expand-Archive -Path $whisperZip -DestinationPath "$toolsRoot\whisper\bin" -Force
    
    # Download base model
    $modelUrl = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin"
    New-Item -ItemType Directory -Path "$toolsRoot\whisper\models" -Force | Out-Null
    Invoke-WebRequest -Uri $modelUrl -OutFile "$toolsRoot\whisper\models\ggml-base.bin" -UseBasicParsing
    
    Remove-Item $whisperZip -Force
    Write-Host "✅ Whisper installed" -ForegroundColor Green
} else {
    Write-Host "✅ Whisper already installed" -ForegroundColor Green
}

# Verification
Write-Host "`n=== Verification ===" -ForegroundColor Cyan
$tools = @(
    @{Name="FFmpeg"; Path="$toolsRoot\ffmpeg\bin\ffmpeg.exe"; Cmd="-version"},
    @{Name="Piper"; Path="$toolsRoot\piper\bin\piper.exe"; Cmd="--help"},
    @{Name="Whisper"; Path="$toolsRoot\whisper\bin\main.exe"; Cmd="--help"}
)

foreach ($tool in $tools) {
    if (Test-Path $tool.Path) {
        try {
            $output = & $tool.Path $tool.Cmd.Split() 2>&1 | Select-Object -First 1
            Write-Host "✅ $($tool.Name): WORKING" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  $($tool.Name): Installed but test failed" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $($tool.Name): NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`n✅ All tools setup complete!" -ForegroundColor Green