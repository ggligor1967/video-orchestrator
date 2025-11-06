# 🏗️ VIDEO ORCHESTRATOR - BUILD INSTRUCTIONS
**MSI Installer Creation Guide**

**Date**: October 14, 2025  
**Target**: Windows 10/11 (x64)  
**Build Tool**: Tauri v1.x

---

## 📋 PREREQUISITES

### Required Software
- [x] **Node.js 18+** - JavaScript runtime
- [x] **pnpm** - Package manager (`npm install -g pnpm`)
- [x] **Rust** - Tauri backend language
  - Download: https://rustup.rs/
  - Run: `rustup default stable`
  - Verify: `rustc --version`
- [ ] **Visual Studio Build Tools** - C++ compiler
  - Download: https://visualstudio.microsoft.com/downloads/
  - Install "Desktop development with C++" workload
  - Or use Visual Studio 2019/2022 Community

### Verify Installation
```bash
# Check Node.js
node --version    # Should be v18.x or higher

# Check pnpm
pnpm --version    # Should be v8.x or higher

# Check Rust
rustc --version   # Should be 1.70+ or higher
cargo --version   # Should be 1.70+ or higher

# Check C++ tools (Windows)
cl.exe            # Should display Microsoft C++ Compiler version
```

---

## 📦 PROJECT STRUCTURE

```
Aplicatia/
├── apps/
│   ├── orchestrator/        # Express.js backend (port 4545)
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   └── ui/                  # Tauri + Svelte frontend
│       ├── src/             # Svelte source files
│       ├── src-tauri/       # Rust/Tauri configuration
│       │   ├── src/
│       │   ├── icons/
│       │   ├── Cargo.toml
│       │   └── tauri.conf.json
│       └── package.json
├── tools/                   # External binaries (bundled in MSI)
│   ├── ffmpeg/
│   │   ├── ffmpeg.exe       ✅ 94 MB
│   │   ├── ffplay.exe       ✅ 95 MB
│   │   └── ffprobe.exe      ✅ 94 MB
│   ├── piper/
│   │   ├── piper.exe        ✅ 0.5 MB
│   │   ├── onnxruntime.dll  ✅ 9 MB
│   │   └── models/
│   │       └── en_US-amy-medium.onnx ✅ 60 MB
│   ├── whisper/
│   │   ├── main.exe         ✅ 0.03 MB
│   │   └── whisper.dll      ✅ 0.5 MB
│   └── godot/
│       └── Godot_v4.5-stable_win64.exe ✅ 155 MB (optional)
└── data/                    # Runtime data directories
    ├── assets/
    │   └── backgrounds/
    ├── cache/
    ├── exports/
    ├── tts/
    └── subs/
```

**Total Tool Size**: ~460 MB (bundled in MSI)

---

## 🔧 BUILD PROCESS

### Step 1: Install Dependencies
```bash
# Root directory
cd d:\playground\Aplicatia

# Install all workspace dependencies
pnpm install

# Verify backend dependencies
cd apps/orchestrator
pnpm install

# Verify UI dependencies
cd ../ui
pnpm install
```

### Step 2: Build Backend (Optional - for testing)
```bash
cd d:\playground\Aplicatia\apps\orchestrator

# Run all tests
pnpm test

# Expected output:
# ✓ 95/95 unit tests passing
# ✓ 23/23 E2E tests passing
# ✓ 0 vulnerabilities
```

### Step 3: Build Frontend Assets
```bash
cd d:\playground\Aplicatia\apps\ui

# Build Svelte app (creates dist/ directory)
pnpm build

# Expected output:
# ✓ dist/index.html created
# ✓ dist/assets/*.js created
# ✓ dist/assets/*.css created
```

### Step 4: Build Tauri MSI Installer
```bash
cd d:\playground\Aplicatia\apps\ui

# Build Windows MSI installer
pnpm tauri build

# This will:
# 1. Compile Rust backend
# 2. Bundle Svelte frontend
# 3. Include tools/ directory
# 4. Create MSI installer
# 5. Output: src-tauri/target/release/bundle/msi/
```

**Build Time Estimate**: 5-10 minutes (first build), 2-3 minutes (subsequent builds)

---

## 📁 BUILD OUTPUT

After successful build, you'll find:

```
apps/ui/src-tauri/target/release/bundle/msi/
├── Video Orchestrator_1.0.0_x64_en-US.msi    # Main installer (~480 MB)
└── Video Orchestrator_1.0.0_x64_en-US.msi.zip # Compressed version
```

### Installer Details
- **File Size**: ~480 MB (includes all tools + models)
- **Install Size**: ~520 MB (with extracted files)
- **Target**: Windows 10/11 (64-bit only)
- **Installation Path**: `C:\Program Files\Video Orchestrator\`
- **Shortcuts**: Desktop + Start Menu

---

## 🧪 TESTING THE INSTALLER

### Pre-Installation Testing
```bash
# Test backend separately
cd d:\playground\Aplicatia\apps\orchestrator
pnpm start
# Visit: http://localhost:4545/health

# Test frontend separately  
cd d:\playground\Aplicatia\apps\ui
pnpm dev
# Visit: http://localhost:5173/
```

### MSI Installation Testing (Clean VM Recommended)
1. **Copy MSI to clean Windows 10/11 machine**
2. **Double-click** `Video Orchestrator_1.0.0_x64_en-US.msi`
3. **Follow installer wizard**:
   - Accept license agreement
   - Choose installation directory (default: `C:\Program Files\Video Orchestrator\`)
   - Select shortcuts (Desktop + Start Menu)
   - Click "Install"
4. **Wait for installation** (~2-3 minutes)
5. **Launch application** from Desktop shortcut
6. **Test complete workflow**:
   - Generate script (AI)
   - Upload/select background
   - Generate voice-over (TTS)
   - Mix audio
   - Generate subtitles
   - Export video

### Validation Checklist
- [ ] Application launches without errors
- [ ] Backend starts automatically (port 4545)
- [ ] UI connects to backend (green status dot)
- [ ] All 6 tabs load correctly
- [ ] FFmpeg works (video processing)
- [ ] Piper works (TTS generation)
- [ ] Whisper works (subtitle generation)
- [ ] Complete workflow produces video file
- [ ] Uninstaller works (removes all files)

---

## 🐛 TROUBLESHOOTING

### Issue 1: Rust Not Found
**Error**: `cargo: command not found` or `rustc: command not found`

**Solution**:
```bash
# Install Rust from https://rustup.rs/
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or on Windows, download rustup-init.exe from rustup.rs
# Restart terminal after installation
rustc --version
```

### Issue 2: Visual Studio Build Tools Missing
**Error**: `error: linker 'link.exe' not found` or `MSVC not found`

**Solution**:
1. Download Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. Run installer
3. Select "Desktop development with C++"
4. Install (requires ~6 GB disk space)
5. Restart terminal

### Issue 3: pnpm Build Fails
**Error**: `ERR_PNPM_*` errors

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules
cd d:\playground\Aplicatia
Remove-Item -Recurse -Force node_modules, apps/*/node_modules

# Reinstall
pnpm install
```

### Issue 4: Tauri Build Hangs
**Error**: Build process freezes or takes >30 minutes

**Solution**:
```bash
# Check Rust target
rustup target list --installed
# Should show: x86_64-pc-windows-msvc

# Add target if missing
rustup target add x86_64-pc-windows-msvc

# Clean Rust build cache
cd apps/ui/src-tauri
cargo clean

# Retry build
pnpm tauri build
```

### Issue 5: MSI Size Too Large (>500 MB)
**Issue**: Installer file is very large

**Explanation**: This is expected because:
- FFmpeg: ~280 MB
- Godot: ~155 MB (optional - can be excluded)
- Piper models: ~60 MB
- Application: ~5 MB

**Optimization**:
```json
// Remove Godot from bundle (optional)
// Edit: apps/ui/src-tauri/tauri.conf.json
{
  "bundle": {
    "resources": [
      "../../tools/ffmpeg/**/*",
      "../../tools/piper/**/*",
      "../../tools/whisper/**/*"
      // Remove: "../../tools/godot/**/*"
    ]
  }
}
```

---

## 🚀 DISTRIBUTION

### Code Signing (Optional but Recommended)
For production release, sign the MSI with a code signing certificate:

```bash
# Requires a valid code signing certificate (.pfx or .p12)
# Update tauri.conf.json:
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

### Release Checklist
- [ ] All tests passing (118/118)
- [ ] Version bumped in `package.json` and `tauri.conf.json`
- [ ] Changelog updated (CHANGELOG.md)
- [ ] MSI built successfully
- [ ] MSI tested on clean Windows VM
- [ ] Code signed (optional)
- [ ] Release notes written
- [ ] GitHub release created with MSI attachment
- [ ] Documentation updated (README, user guide)

---

## 📊 BUILD METRICS

### Expected Build Times
- **Full Clean Build**: 8-12 minutes
- **Incremental Build**: 2-3 minutes
- **Rust Compilation**: 3-5 minutes
- **Asset Bundling**: 1-2 minutes
- **MSI Creation**: 1-2 minutes

### Output Sizes
- **Rust Binary**: ~5 MB
- **Frontend Assets**: ~2 MB
- **Tools Bundle**: ~460 MB
- **Total MSI**: ~480 MB
- **Installed Size**: ~520 MB

---

## 🔗 USEFUL LINKS

- **Tauri Documentation**: https://tauri.app/v1/guides/
- **Tauri Build Guide**: https://tauri.app/v1/guides/building/
- **Rust Installation**: https://rustup.rs/
- **FFmpeg Downloads**: https://ffmpeg.org/download.html
- **Piper TTS**: https://github.com/rhasspy/piper
- **Whisper.cpp**: https://github.com/ggerganov/whisper.cpp

---

## 📝 NOTES

- **First build takes longer**: Rust compiles all dependencies
- **Subsequent builds are faster**: Cached dependencies
- **MSI is self-contained**: No internet required for installation
- **All tools are bundled**: FFmpeg, Piper, Whisper included
- **Data directory**: Created in `%APPDATA%/video-orchestrator/` on first run

---

**Build Guide Version**: 1.0  
**Last Updated**: October 14, 2025  
**For**: Video Orchestrator v1.0.0  
**Platform**: Windows 10/11 (x64)
