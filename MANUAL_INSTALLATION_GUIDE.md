# 🔧 Manual Installation Guide - External Tools

**Video Orchestrator - Complete Setup Guide**  
**Platform:** Windows 10/11 (64-bit)  
**Time Required:** 30-45 minutes  
**Disk Space:** ~500 MB total

---

## 📋 Prerequisites

- Windows 10 or Windows 11 (64-bit)
- Internet connection for downloads
- Administrator privileges (optional, but recommended)
- 7-Zip or WinRAR for extracting archives

---

## 📦 What You'll Install

| Tool | Purpose | Size | Required? |
|------|---------|------|-----------|
| **FFmpeg** | Video/audio processing | ~120 MB | ✅ YES |
| **Piper TTS** | Text-to-speech generation | ~50 MB | ✅ YES |
| **Whisper.cpp** | Subtitle generation | ~10 MB | ✅ YES |
| **Voice Models** | TTS voice data | ~20 MB each | ✅ YES (at least 1) |
| **Language Models** | Speech recognition data | ~75 MB each | ✅ YES (at least 1) |
| **Godot Engine** | Voxel background generator | ~150 MB | ⭕ OPTIONAL |

**Total Required:** ~300 MB  
**With Optional:** ~450 MB

---

## 🎬 STEP 1: Install FFmpeg

### 1.1 Download FFmpeg

**Option A: Gyan.dev Build (Recommended)**
1. Open browser and go to: https://www.gyan.dev/ffmpeg/builds/
2. Scroll down to "Release Builds" section
3. Click on **"ffmpeg-release-essentials.zip"** (~120 MB)
4. Wait for download to complete

**Option B: Official FFmpeg.org**
1. Go to: https://ffmpeg.org/download.html#build-windows
2. Click "Windows builds from gyan.dev"
3. Download **"ffmpeg-release-essentials.zip"**

### 1.2 Extract FFmpeg

1. Locate the downloaded file: `ffmpeg-release-essentials.zip`
2. Right-click → **Extract All...**
3. Extract to a temporary folder (e.g., `Downloads\ffmpeg-extract\`)
4. Open the extracted folder:
   ```
   ffmpeg-7.0-essentials_build/
   └── bin/
       ├── ffmpeg.exe     ← We need this
       ├── ffprobe.exe    ← We need this too
       └── ffplay.exe     ← Optional
   ```

### 1.3 Copy to Project

1. Open File Explorer and navigate to your project:
   ```
   D:\playground\Aplicatia\tools\ffmpeg\
   ```

2. Copy these files from the extracted `bin\` folder:
   - `ffmpeg.exe` → `tools\ffmpeg\ffmpeg.exe`
   - `ffprobe.exe` → `tools\ffmpeg\ffprobe.exe`

3. Your `tools\ffmpeg\` folder should now contain:
   ```
   tools/ffmpeg/
   ├── ffmpeg.exe      ✅ (~120 MB)
   ├── ffprobe.exe     ✅ (~20 MB)
   └── README.md       (already exists)
   ```

### 1.4 Verify FFmpeg Installation

1. Open PowerShell in project root:
   ```powershell
   cd D:\playground\Aplicatia
   .\tools\ffmpeg\ffmpeg.exe -version
   ```

2. You should see output like:
   ```
   ffmpeg version 7.0-essentials_build
   Copyright (c) 2000-2024 the FFmpeg developers
   ...
   ```

✅ **FFmpeg installed successfully!**

---

## 🎤 STEP 2: Install Piper TTS

### 2.1 Download Piper TTS

1. Go to GitHub releases: https://github.com/rhasspy/piper/releases
2. Find the **latest release** (v1.2.0 or newer)
3. Download: **`piper_windows_amd64.zip`** (~10 MB)
4. Wait for download to complete

### 2.2 Extract Piper TTS

1. Locate the downloaded file: `piper_windows_amd64.zip`
2. Right-click → **Extract All...**
3. Extract to a temporary folder (e.g., `Downloads\piper-extract\`)
4. Open the extracted folder:
   ```
   piper/
   ├── piper.exe           ← We need this
   ├── espeak-ng-data/     ← We need this folder
   ├── *.dll               ← We need these
   └── README.md
   ```

### 2.3 Copy to Project

1. Navigate to your project:
   ```
   D:\playground\Aplicatia\tools\piper\
   ```

2. Copy **ALL contents** from the extracted folder to `tools\piper\`:
   - `piper.exe`
   - `espeak-ng-data\` (entire folder)
   - All `.dll` files (onnxruntime.dll, etc.)

3. Your `tools\piper\` folder should now contain:
   ```
   tools/piper/
   ├── piper.exe           ✅
   ├── espeak-ng-data/     ✅ (folder)
   ├── onnxruntime.dll     ✅
   ├── (other .dll files)  ✅
   ├── models/             (create this folder)
   └── README.md           (already exists)
   ```

### 2.4 Download Voice Models

Piper needs at least one voice model to work. We'll download a high-quality English voice.

1. **Create models folder** (if it doesn't exist):
   ```powershell
   cd D:\playground\Aplicatia\tools\piper
   mkdir models
   ```

2. **Download voice model files:**

   **Recommended: Amy (High Quality, Female, US English)**
   - Model URL: https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx
   - Config URL: https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json

   **Alternative: Lessac (Medium Quality, Female, US English)**
   - Model URL: https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
   - Config URL: https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

3. **Download using PowerShell:**
   ```powershell
   cd D:\playground\Aplicatia\tools\piper\models

   # Download Amy voice (recommended)
   Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx" -OutFile "en_US-amy-medium.onnx"
   Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json" -OutFile "en_US-amy-medium.onnx.json"
   ```

4. **Verify models folder:**
   ```
   tools/piper/models/
   ├── en_US-amy-medium.onnx       ✅ (~20 MB)
   └── en_US-amy-medium.onnx.json  ✅ (~1 KB)
   ```

### 2.5 Verify Piper Installation

1. Test Piper TTS:
   ```powershell
   cd D:\playground\Aplicatia
   echo "Hello, this is a test" | .\tools\piper\piper.exe --model .\tools\piper\models\en_US-amy-medium.onnx --output_file test.wav
   ```

2. Check if `test.wav` was created (you can play it to hear the voice)

✅ **Piper TTS installed successfully!**

---

## 📝 STEP 3: Install Whisper.cpp

### 3.1 Download Whisper.cpp

1. Go to GitHub releases: https://github.com/ggerganov/whisper.cpp/releases
2. Find the **latest release** (v1.5.4 or newer)
3. Download: **`whisper-bin-x64.zip`** (~10 MB)
4. Wait for download to complete

### 3.2 Extract Whisper.cpp

1. Locate the downloaded file: `whisper-bin-x64.zip`
2. Right-click → **Extract All...**
3. Extract to a temporary folder (e.g., `Downloads\whisper-extract\`)
4. Open the extracted folder:
   ```
   whisper-bin-x64/
   ├── main.exe         ← We need this (main executable)
   ├── bench.exe
   ├── quantize.exe
   └── README.md
   ```

### 3.3 Copy to Project

1. Navigate to your project:
   ```
   D:\playground\Aplicatia\tools\whisper\
   ```

2. Copy these files from the extracted folder:
   - `main.exe` → `tools\whisper\main.exe`
   - Any `.dll` files (if present)

3. Your `tools\whisper\` folder should now contain:
   ```
   tools/whisper/
   ├── main.exe        ✅
   ├── models/         (create this folder)
   └── README.md       (already exists)
   ```

### 3.4 Download Language Models

Whisper needs at least one language model to work.

1. **Create models folder** (if it doesn't exist):
   ```powershell
   cd D:\playground\Aplicatia\tools\whisper
   mkdir models
   ```

2. **Choose a model based on your needs:**

   | Model | Size | Speed | Accuracy | Best For |
   |-------|------|-------|----------|----------|
   | `tiny.en` | ~75 MB | ⚡ Fastest | ⭐ Basic | Testing |
   | `base.en` | ~140 MB | ⚡⚡ Fast | ⭐⭐ Good | **Recommended** |
   | `small.en` | ~460 MB | ⚡⚡⚡ Medium | ⭐⭐⭐ Better | Production |
   | `medium.en` | ~1.5 GB | ⚡⚡⚡⚡ Slow | ⭐⭐⭐⭐ Best | High Quality |

3. **Download using PowerShell (base.en recommended):**
   ```powershell
   cd D:\playground\Aplicatia\tools\whisper\models

   # Download base.en model (recommended for balance of speed/quality)
   Invoke-WebRequest -Uri "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin" -OutFile "ggml-base.en.bin"
   ```

   **Alternative - tiny.en (faster, for testing):**
   ```powershell
   Invoke-WebRequest -Uri "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin" -OutFile "ggml-tiny.en.bin"
   ```

4. **Verify models folder:**
   ```
   tools/whisper/models/
   └── ggml-base.en.bin    ✅ (~140 MB)
   ```

### 3.5 Verify Whisper Installation

1. Test Whisper (requires an audio file):
   ```powershell
   cd D:\playground\Aplicatia
   .\tools\whisper\main.exe --version
   ```

2. You should see version information

✅ **Whisper.cpp installed successfully!**

---

## 🎮 STEP 4: Install Godot Engine (OPTIONAL)

This is only needed if you want to generate custom voxel backgrounds.

### 4.1 Download Godot

1. Go to: https://godotengine.org/download/windows/
2. Download: **Godot 4.x (Standard version)** (~150 MB)
3. Choose the `.exe` version (not the installer)

### 4.2 Install Godot

1. The download is a single `.exe` file: `Godot_v4.x.x-stable_win64.exe`
2. Copy it to:
   ```
   D:\playground\Aplicatia\tools\godot\Godot_v4.x.x-stable_win64.exe
   ```

3. Your `tools\godot\` folder should contain:
   ```
   tools/godot/
   ├── Godot_v4.x.x-stable_win64.exe    ✅
   └── README.md                         (already exists)
   ```

### 4.3 Verify Godot Installation

1. Double-click `Godot_v4.x.x-stable_win64.exe` to launch
2. Godot should open the project manager

✅ **Godot installed successfully!**

---

## ✅ STEP 5: Final Verification

### 5.1 Check All Tools

Run this PowerShell script to verify all installations:

```powershell
cd D:\playground\Aplicatia

Write-Host "`nVerifying tool installations..." -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Check FFmpeg
if (Test-Path "tools\ffmpeg\ffmpeg.exe") {
    $ffmpegVersion = & "tools\ffmpeg\ffmpeg.exe" -version 2>&1 | Select-Object -First 1
    Write-Host "[OK] FFmpeg: $ffmpegVersion" -ForegroundColor Green
} else {
    Write-Host "[MISSING] FFmpeg not found" -ForegroundColor Red
}

# Check Piper
if (Test-Path "tools\piper\piper.exe") {
    Write-Host "[OK] Piper TTS: Installed" -ForegroundColor Green
    
    # Check voice models
    $models = Get-ChildItem "tools\piper\models\*.onnx" -ErrorAction SilentlyContinue
    if ($models) {
        Write-Host "    Voice models: $($models.Count) found" -ForegroundColor Green
        foreach ($model in $models) {
            Write-Host "    - $($model.Name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "    [WARNING] No voice models found" -ForegroundColor Yellow
    }
} else {
    Write-Host "[MISSING] Piper TTS not found" -ForegroundColor Red
}

# Check Whisper
if (Test-Path "tools\whisper\main.exe") {
    Write-Host "[OK] Whisper.cpp: Installed" -ForegroundColor Green
    
    # Check language models
    $models = Get-ChildItem "tools\whisper\models\*.bin" -ErrorAction SilentlyContinue
    if ($models) {
        Write-Host "    Language models: $($models.Count) found" -ForegroundColor Green
        foreach ($model in $models) {
            Write-Host "    - $($model.Name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "    [WARNING] No language models found" -ForegroundColor Yellow
    }
} else {
    Write-Host "[MISSING] Whisper.cpp not found" -ForegroundColor Red
}

# Check Godot (optional)
if (Test-Path "tools\godot\*.exe") {
    Write-Host "[OK] Godot Engine: Installed (optional)" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Godot Engine: Not installed (optional)" -ForegroundColor Yellow
}

Write-Host "`n=========================================`n" -ForegroundColor Cyan
```

### 5.2 Test Backend Health Endpoint

1. Start the backend server:
   ```powershell
   cd D:\playground\Aplicatia\apps\orchestrator
   pnpm dev
   ```

2. Open browser and go to: http://127.0.0.1:4545/health

3. You should see JSON response with `tools: true`:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-13T...",
     "uptime": 5.123,
     "version": "1.0.0",
     "services": {
       "api": "running",
       "ffmpeg": "available",
       "piper": "available",
       "whisper": "available"
     },
     "tools": {
       "ffmpeg": true,
       "piper": true,
       "whisper": true
     }
   }
   ```

✅ **All tools verified and working!**

---

## 🐛 Troubleshooting

### Problem: "FFmpeg not found" or "Access denied"

**Solution:**
1. Make sure you copied `ffmpeg.exe` to the correct location
2. Check file permissions (right-click → Properties → Unblock)
3. Try running PowerShell as Administrator

### Problem: "Piper TTS fails with DLL error"

**Solution:**
1. Make sure you copied ALL `.dll` files from the Piper zip
2. Copy the entire `espeak-ng-data\` folder
3. Install Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe

### Problem: "Whisper model not found"

**Solution:**
1. Verify the model file is in `tools\whisper\models\`
2. Check the filename matches exactly: `ggml-base.en.bin`
3. Re-download if the file is corrupted

### Problem: "Voice model not working"

**Solution:**
1. Make sure you downloaded BOTH files:
   - `.onnx` (the model)
   - `.onnx.json` (the config)
2. Both files must have the same base name
3. Try a different voice model

### Problem: Large downloads fail or timeout

**Solution:**
Use a download manager like:
- Free Download Manager: https://www.freedownloadmanager.org/
- Internet Download Manager: https://www.internetdownloadmanager.com/

---

## 📚 Additional Resources

### Voice Models for Piper TTS
Browse all available voices:
- https://rhasspy.github.io/piper-samples/
- https://huggingface.co/rhasspy/piper-voices

Recommended voices:
- **en_US-amy-medium** (Female, US English, High Quality)
- **en_US-lessac-medium** (Female, US English, Clear)
- **en_GB-alan-medium** (Male, British English)
- **en_US-libritts-high** (Mixed, US English, Highest Quality)

### Language Models for Whisper
- Official models: https://huggingface.co/ggerganov/whisper.cpp
- Model comparison: https://github.com/ggerganov/whisper.cpp#model-files

### FFmpeg Documentation
- Official docs: https://ffmpeg.org/documentation.html
- Video filters: https://ffmpeg.org/ffmpeg-filters.html
- Audio filters: https://ffmpeg.org/ffmpeg-filters.html#Audio-Filters

---

## ✨ Next Steps

After successful installation:

1. **Configure environment variables** (optional):
   ```powershell
   cd D:\playground\Aplicatia\apps\orchestrator
   cp .env.example .env
   # Edit .env with your preferences
   ```

2. **Test video processing**:
   - Add a sample video to `data\assets\backgrounds\`
   - Test crop endpoint: `POST http://127.0.0.1:4545/video/crop`

3. **Test TTS generation**:
   - Test TTS endpoint: `POST http://127.0.0.1:4545/tts/generate`
   - Hear your first AI-generated voice!

4. **Run all tests**:
   ```powershell
   cd D:\playground\Aplicatia\apps\orchestrator
   pnpm test
   ```

5. **Start developing**:
   ```powershell
   # Start both backend and frontend
   cd D:\playground\Aplicatia
   pnpm dev
   ```

---

**Installation Complete!** 🎉  
**You're ready to create amazing vertical videos!** 🚀

Need help? Check:
- `README.md` - Project overview
- `API.md` - API documentation
- `QUICK_REFERENCE.txt` - Quick commands
- `tools/*/README.md` - Tool-specific guides
