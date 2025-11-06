# 📦 MSI Build Guide - Video Orchestrator

**Status**: ✅ Fixed and Ready  
**Platform**: Windows 10/11  
**Output**: MSI Installer Package

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **pnpm** - Install: `npm install -g pnpm`
3. **Rust** - [Download](https://rustup.rs/)
4. **Visual Studio Build Tools** - [Download](https://visualstudio.microsoft.com/downloads/)

### One-Command Build

```powershell
# From project root
.\scripts\build-msi.ps1
```

---

## 📋 Detailed Build Process

### Step 1: Prepare Environment

```powershell
# Run preparation script
.\scripts\prepare-msi-build.ps1

# Or manually:
pnpm install
pnpm --filter @video-orchestrator/shared build
pnpm --filter @app/ui build
```

### Step 2: Build MSI

```powershell
# Navigate to UI directory
cd apps\ui

# Build release MSI
pnpm tauri build

# Or build debug MSI (faster, larger)
pnpm tauri build --debug
```

### Step 3: Locate Installer

**Release Build**:
```
apps\ui\src-tauri\target\release\bundle\msi\Video Orchestrator_1.0.0_x64_en-US.msi
```

**Debug Build**:
```
apps\ui\src-tauri\target\debug\bundle\msi\Video Orchestrator_1.0.0_x64_en-US.msi
```

---

## 🔧 Build Options

### Clean Build

```powershell
# Remove all previous builds
.\scripts\build-msi.ps1 -Clean
```

### Debug Build

```powershell
# Faster build, larger size, includes debug symbols
.\scripts\build-msi.ps1 -Debug
```

### Skip Components

```powershell
# Skip backend build
.\scripts\prepare-msi-build.ps1 -SkipBackend

# Skip tools verification
.\scripts\prepare-msi-build.ps1 -SkipTools
```

---

## 📦 What's Included in MSI

### Application Files
- ✅ Tauri desktop application (Rust + Svelte)
- ✅ Frontend assets (HTML, CSS, JS)
- ✅ Application icons and resources

### NOT Included (Separate Installation)
- ❌ Backend server (Node.js) - runs separately
- ❌ External tools (FFmpeg, Piper, Whisper) - must be in `tools/` directory
- ❌ Data directories - created on first run

---

## 🏗️ Architecture Changes

### Previous Configuration (Broken)

```json
{
  "resources": ["../../tools/**/*", "../../data/assets/**/*"],
  "externalBin": [
    "../../tools/ffmpeg/ffmpeg.exe",
    "../../tools/piper/piper.exe",
    "../../tools/whisper/whisper.exe"
  ]
}
```

**Problems**:
- ❌ Relative paths incorrect
- ❌ Large binary files (500MB+) in MSI
- ❌ Build timeout issues
- ❌ Network dependency during build

### Current Configuration (Fixed)

```json
{
  "resources": [],
  "externalBin": []
}
```

**Benefits**:
- ✅ Smaller MSI size (~50MB vs 500MB+)
- ✅ Faster build time
- ✅ No network issues
- ✅ Tools installed separately

---

## 📁 Deployment Structure

### After MSI Installation

```
C:\Program Files\Video Orchestrator\
├── Video Orchestrator.exe    # Tauri app
├── resources\                 # App resources
└── ...

User must have separately:
├── tools\                     # External binaries
│   ├── ffmpeg\
│   ├── piper\
│   └── whisper\
└── Backend server running on localhost:4545
```

---

## 🔍 Troubleshooting

### Build Fails: "Rust not found"

```powershell
# Install Rust
winget install Rustlang.Rustup

# Or download from: https://rustup.rs/
```

### Build Fails: "MSVC not found"

```powershell
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Or download from: https://visualstudio.microsoft.com/downloads/
```

### Build Fails: "pnpm not found"

```powershell
npm install -g pnpm
```

### Build Timeout

```powershell
# Increase timeout
$env:TAURI_BUILD_TIMEOUT = "600"  # 10 minutes
pnpm tauri build
```

### MSI Not Created

Check logs in:
```
apps\ui\src-tauri\target\release\build\*.log
```

---

## 🎯 Post-Build Steps

### 1. Test MSI Installer

```powershell
# Install MSI
msiexec /i "Video Orchestrator_1.0.0_x64_en-US.msi" /l*v install.log

# Uninstall
msiexec /x "Video Orchestrator_1.0.0_x64_en-US.msi" /l*v uninstall.log
```

### 2. Sign MSI (Optional)

```powershell
# Sign with certificate
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com "Video Orchestrator_1.0.0_x64_en-US.msi"
```

### 3. Create Portable Package

```powershell
# Copy required files
mkdir VideoOrchestrator-Portable
copy "Video Orchestrator.exe" VideoOrchestrator-Portable\
xcopy /E /I tools VideoOrchestrator-Portable\tools\
xcopy /E /I data VideoOrchestrator-Portable\data\

# Create ZIP
Compress-Archive -Path VideoOrchestrator-Portable -DestinationPath VideoOrchestrator-1.0.0-Portable.zip
```

---

## 📊 Build Metrics

### Typical Build Times

| Configuration | Time | Size |
|--------------|------|------|
| Debug Build | 2-5 min | ~80 MB |
| Release Build | 5-10 min | ~50 MB |
| Clean Build | 10-15 min | ~50 MB |

### System Requirements

**Build Machine**:
- CPU: 4+ cores recommended
- RAM: 8GB minimum, 16GB recommended
- Disk: 10GB free space
- Network: Not required (after dependencies installed)

**Target Machine**:
- Windows 10/11 (64-bit)
- 4GB RAM minimum
- 2GB disk space
- .NET Framework 4.7.2+ (usually pre-installed)

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Build MSI

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Build MSI
        run: .\scripts\build-msi.ps1
      
      - name: Upload MSI
        uses: actions/upload-artifact@v3
        with:
          name: msi-installer
          path: apps/ui/src-tauri/target/release/bundle/msi/*.msi
```

---

## 📝 Configuration Reference

### tauri.conf.json

```json
{
  "package": {
    "productName": "Video Orchestrator",
    "version": "1.0.0"
  },
  "bundle": {
    "identifier": "com.videoorchestrator.app",
    "category": "VideoUtility",
    "resources": [],
    "externalBin": [],
    "windows": {
      "wix": {
        "language": ["en-US"]
      }
    }
  }
}
```

### Key Changes from Original

1. **Removed `resources`** - No longer bundling tools/data
2. **Removed `externalBin`** - No external executables in MSI
3. **Simplified bundle** - Only app files included

---

## ✅ Verification Checklist

After building MSI:

- [ ] MSI file created in target directory
- [ ] MSI size is reasonable (~50MB)
- [ ] MSI installs without errors
- [ ] Application launches successfully
- [ ] Application can connect to backend (if running)
- [ ] No missing DLL errors
- [ ] Uninstall works cleanly

---

## 🆘 Support

### Common Issues

**Issue**: Build hangs at "Bundling..."
**Solution**: Increase timeout, check antivirus

**Issue**: MSI too large (>100MB)
**Solution**: Verify `resources` and `externalBin` are empty

**Issue**: App won't launch after install
**Solution**: Check Windows Event Viewer for errors

### Getting Help

1. Check build logs in `target/release/build/`
2. Review Tauri documentation: https://tauri.app/
3. Check project issues on GitHub

---

## 📚 Additional Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [WiX Toolset](https://wixtoolset.org/)
- [Windows Installer](https://docs.microsoft.com/en-us/windows/win32/msi/windows-installer-portal)
- [Code Signing Guide](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)

---

**Last Updated**: 2025-01-20  
**Version**: 1.0.1  
**Status**: ✅ Production Ready
