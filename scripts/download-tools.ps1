# Download Tools Script - Video Orchestrator
# Created: November 3, 2025
# Purpose: Download and verify required tools (FFmpeg, Piper, Whisper)

Write-Host "=== Downloading Required Tools ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

$tools = @{
    "ffmpeg" = @{
        url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
        size = 283
        exe = "ffmpeg.exe"
        extractPath = "bin"
    }
    "piper" = @{
        url = "https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_windows_amd64.zip"
        size = 70
        exe = "piper.exe"
        extractPath = ""
    }
    "whisper" = @{
        url = "https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.4/whisper-bin-x64.zip"
        size = 50
        exe = "main.exe"
        extractPath = ""
    }
}

$totalDownloaded = 0
$successCount = 0
$failCount = 0

foreach ($tool in $tools.Keys) {
    Write-Host "--- Processing: $tool ---" -ForegroundColor Yellow
    $toolPath = "tools\$tool"
    
    # Create directory
    if (-not (Test-Path $toolPath)) {
        New-Item -ItemType Directory -Path $toolPath -Force | Out-Null
        Write-Host "Created directory: $toolPath" -ForegroundColor Gray
    }
    
    # Check if already exists
    $existingExe = Get-ChildItem -Path $toolPath -Filter $tools[$tool].exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($existingExe) {
        $existingSize = [math]::Round($existingExe.Length/1MB, 2)
        $expectedSize = $tools[$tool].size
        
        if ($existingSize -ge ($expectedSize * 0.8)) {
            Write-Host "✅ $tool already exists: $existingSize MB (at $($existingExe.FullName))" -ForegroundColor Green
            $totalDownloaded += $existingSize
            $successCount++
            continue
        } else {
            Write-Host "⚠️ Existing $tool is too small ($existingSize MB), re-downloading..." -ForegroundColor Yellow
        }
    }
    
    # Download and extract
    $zipPath = "$toolPath\download.zip"
    Write-Host "Downloading from: $($tools[$tool].url)" -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $tools[$tool].url -OutFile $zipPath -UseBasicParsing -TimeoutSec 300
        Write-Host "Download complete: $(([math]::Round((Get-Item $zipPath).Length/1MB, 2))) MB" -ForegroundColor Gray
        
        Write-Host "Extracting..." -ForegroundColor Gray
        Expand-Archive -Path $zipPath -DestinationPath $toolPath -Force
        Remove-Item $zipPath
        
        # Verify extraction
        $exePath = Get-ChildItem -Path $toolPath -Filter $tools[$tool].exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($exePath) {
            $size = [math]::Round($exePath.Length/1MB, 2)
            $expectedSize = $tools[$tool].size
            
            if ($size -ge ($expectedSize * 0.8)) {
                Write-Host "✅ $tool installed successfully: $size MB" -ForegroundColor Green
                Write-Host "   Location: $($exePath.FullName)" -ForegroundColor Gray
                $totalDownloaded += $size
                $successCount++
            } else {
                Write-Host "⚠️ $tool installed but size suspicious: $size MB (expected ~$expectedSize MB)" -ForegroundColor Yellow
                $totalDownloaded += $size
                $successCount++
            }
        } else {
            Write-Host "❌ $tool installation failed - exe not found after extraction" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ $tool download/extraction failed: $_" -ForegroundColor Red
        $failCount++
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "=== Download Summary ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host "Successful: $successCount/$($tools.Count)" -ForegroundColor $(if($successCount -eq $tools.Count){'Green'}else{'Yellow'})
Write-Host "Failed: $failCount" -ForegroundColor $(if($failCount -eq 0){'Green'}else{'Red'})
Write-Host ""

# Detailed verification
Write-Host "=== Detailed Tool Verification ===" -ForegroundColor Cyan
$verifiedTools = Get-ChildItem tools -Recurse -Include *.exe -ErrorAction SilentlyContinue
$totalSize = 0

if ($verifiedTools) {
    $verifiedTools | ForEach-Object {
        $sizeMB = [math]::Round($_.Length/1MB, 2)
        $totalSize += $sizeMB
        Write-Host "  $($_.Directory.Name)\$($_.Name): $sizeMB MB" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "Total tools size: $totalSize MB" -ForegroundColor $(if($totalSize -gt 500){'Green'}elseif($totalSize -gt 300){'Yellow'}else{'Red'})
    
    if ($totalSize -gt 500) {
        Write-Host "✅ Tools ready for MSI build" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️ Tools incomplete - MSI may be undersized" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ No tools found" -ForegroundColor Red
    exit 1
}
