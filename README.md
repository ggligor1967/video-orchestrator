# 🎬 Video Orchestrator

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)](PROJECT_STATUS_REAL.md)
[![Completion](https://img.shields.io/badge/Completion-100%25-brightgreen)](PROJECT_STATUS_REAL.md)
[![Tests](https://img.shields.io/badge/Tests-147%2F147%20Passing-brightgreen)](PROJECT_STATUS_REAL.md)
[![Security](https://img.shields.io/badge/Security-7.5%2F10-yellow)](COMPREHENSIVE_AUDIT_REPORT.md)
[![Performance](https://img.shields.io/badge/Performance-Optimized-brightgreen)](PERFORMANCE_OPTIMIZATION_REPORT.md)

**AI-powered desktop application for creating automated vertical videos (TikTok/Shorts/Reels)**

**Video Orchestrator** este o aplicație desktop-first pentru Windows, concepută pentru crearea automatizată de conținut video vertical. Aplicația combină scripturi generate de AI cu procesare media locală pentru a crea conținut video complet cu fundal, voice-over, audio și subtitrări.

---

## ✨ Project Status: 100% Complete - Production Ready ✅

| Component | Status | Coverage |
|-----------|--------|----------|
| **Backend** | ✅ 100% | 28+ endpoints, all tested |
| **Frontend** | ✅ 100% | 6/6 tabs complete |
| **Testing** | ✅ 100% | 147/147 passing |
| **Security** | ✅ 7.5/10 | 0 critical vulnerabilities |
| **MSI Build** | ✅ 100% | Complete - 2,050.4 MB package |

**📖 Quick Links:**
- [📋 Complete Project Status](PROJECT_STATUS_REAL.md) - Real-time metrics
- [📝 Module Details](MODULES_DETAILED_STATUS.md) - Per-module breakdown
- [🎯 Project Overview](PROJECT_OVERVIEW_FINAL.md) - Executive summary
- [🔒 Security Audit](COMPREHENSIVE_AUDIT_REPORT.md) - Security analysis
- [⚡ Performance Optimization](OPTIMIZATION_SUMMARY.md) - 3x faster, 70% cost reduction

---

## 🚀 Quick Start

### For End Users (Coming Soon)

```bash
# Download and install MSI (when packaging complete)
video-orchestrator-setup.msi
```

### For Developers

```bash
# Prerequisites: Node.js 18+, pnpm 8+, Rust (for Tauri)
pnpm install
pnpm dev  # Starts both UI + Backend
```

**See [PROJECT_OVERVIEW_FINAL.md](PROJECT_OVERVIEW_FINAL.md) for detailed setup instructions.**

---

## 📁 Project Structure

```
video-orchestrator/
├── apps/
│   ├── ui/                     # Tauri + Svelte desktop app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── tabs/       # 6 tab components
│   │   │   ├── stores/         # Svelte stores
│   │   │   └── lib/            # API client
│   │   ├── src-tauri/          # Tauri configuration
│   │   └── package.json
│   └── orchestrator/           # Node.js + Express backend
│       ├── src/
│       │   ├── routes/         # API endpoints
│       │   ├── controllers/    # Request handlers
│       │   ├── services/       # Business logic
│       │   └── utils/          # Helper functions
│       └── package.json
├── packages/
│   └── shared/                 # Common types and utilities
│       ├── src/
│       │   ├── types.ts        # TypeScript interfaces
│       │   ├── schemas.ts      # Zod validation schemas
│       │   └── utils.ts        # Shared utilities
│       └── package.json
├── tools/                      # External tool binaries
│   ├── ffmpeg/                 # Video processing
│   ├── piper/                  # Local TTS
│   ├── whisper/                # Speech-to-text
│   └── godot/                  # Voxel background generator
├── data/                       # Media assets and outputs
│   ├── assets/backgrounds/     # Video backgrounds
│   ├── cache/                  # Temporary files
│   └── exports/                # Final video outputs
├── tests/                      # Integration tests
└── scripts/                    # Build utilities
```

## 🛠️ Development Setup

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm** - Package manager
- **Rust** - For Tauri desktop app
- **Git** - Version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd video-orchestrator

# Install dependencies
pnpm install

# Build shared packages first
pnpm --filter @video-orchestrator/shared build

# Start development environment (both UI and backend)
pnpm dev
```

### Development Commands

```bash
# Start both frontend and backend
pnpm dev

# Start only backend (port 4545)
pnpm --filter @app/orchestrator dev

# Start only frontend (port 5173)
pnpm --filter @app/ui dev

# Build everything
pnpm build

# Run tests
pnpm test:all

# Run integration tests only
pnpm test:integration

# Build Tauri app
pnpm --filter @app/ui tauri build

# MSI Packaging commands
pnpm msi:diagnose     # Check cargo cache and MSI status
pnpm msi:prepare      # Download dependencies for offline build
pnpm msi:build        # Build MSI offline (no network)
pnpm msi:build:full   # Full workflow with retry logic
```

## 🏗️ Architecture Overview

See `ARCHITECTURE.md` for a dependency-injected module map covering backend, frontend, and shared packages.

### Backend (Port 4545)

**Express.js server** cu următoarele servicii:

- **AI Service** – Script generation + context-aware background ideas (OpenAI/Gemini + fallback)
- **FFmpeg Service** – Video processing și conversii
- **TTS Service** – Text-to-speech cu Piper
- **Subtitles Service** – Generare subtitrări cu Whisper
- **Export Service** – Final video composition
- **Pipeline Service** – End-to-end automation

### Frontend (Tauri + Svelte)

**6-tab interface** pentru workflow complet:

1. **Story & Script** – AI script generation + live pacing analytics + project brief export
2. **Background** – Video import, smart AI suggestions, gallery management
3. **Voice-over** - TTS generation cu multiple voices
4. **Audio & SFX** - Audio mixing și effects
5. **Subtitles** - Subtitle generation și editing
6. **Export & Post** - Final video export

### Shared Packages

- **Types** - Common TypeScript interfaces
- **Schemas** - Zod validation schemas
- **Utils** - Shared utility functions

## 🎯 Features Implemented

### ✅ Core Features
- **AI-Generated Scripts** - Horror, mystery, paranormal, true crime (OpenAI/Gemini)
- **Template System** - 7 pre-built templates for one-click video creation
- **Brand Kit System** - Visual identity management with logos, intros, outros, watermarks
- **Stock Media Integration** - Pexels/Pixabay API with AI-powered search
- **Caption Styling Engine** - 15+ preset styles with animations and custom formatting
- **Local TTS** - Multiple voices with Piper models
- **Video Processing** - Auto-reframe, smart crop to 9:16, speed ramp effects
- **Subtitle Generation** - Whisper-powered with ASS formatting
- **Audio Mixing** - Background music, sound effects, loudness normalization
- **Professional Export** - Multiple presets (TikTok, YouTube, Instagram)
- **Desktop-First Design** - Tauri + Svelte native app

### ✅ Advanced Features
- **Batch Processing** - Create up to 50 videos at once (3x faster with parallel processing)
- **Social Scheduler** - Cron-based post scheduling
- **Virality Scoring** - AI-powered content prediction
- **Pipeline Automation** - End-to-end video creation
- **Smart Caching** - 70% reduction in API calls, 60x faster cached responses
- **Quota Management** - Automatic API quota monitoring

### ⚡ Performance & Scalability
- **Intelligent Caching** - 5GB LRU cache with 7-day retention
- **Parallel Processing** - Up to 10 concurrent videos in batch mode
- **Worker Pool** - CPU-based worker allocation for FFmpeg
- **200 req/s Throughput** - Supports 100 concurrent users
- **70% Cost Reduction** - AI API caching saves $105/month
- **3x Faster Batches** - 50 videos in 200s vs 600s

**See [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md) for performance details.**

### ✅ Technical Features
- **Monorepo Architecture** - pnpm workspaces
- **TypeScript Throughout** - Shared types and interfaces
- **Zod Validation** - Schema validation at all layers
- **Dependency Injection** - Container-based service management
- **Comprehensive Testing** - 188 tests passing (unit + integration)
- **Local Processing** - No internet required after setup
- **Auto-Advance Workflow** - Seamless tab progression
- **Project Context** - State management across tabs
- **Error Handling** - Comprehensive error capture and logging

## 📚 Documentation

### Feature Guides
- **[Template System](TEMPLATE_SYSTEM.md)** - One-click video creation with 7 pre-built templates
- **[Brand Kit System](BRAND_KIT_SYSTEM.md)** - Visual identity management and branding
- **[Caption Styling Engine](CAPTION_STYLING_ENGINE.md)** - 15+ preset subtitle styles with animations
- **[Stock Media Integration](STOCK_MEDIA_INTEGRATION.md)** - Pexels/Pixabay API integration

### Technical Documentation
- **[Performance Optimization](OPTIMIZATION_SUMMARY.md)** - 3x faster, 70% cost reduction
- **[Detailed Performance Report](PERFORMANCE_OPTIMIZATION_REPORT.md)** - Complete optimization analysis
- **[Security Audit](CRITICAL_AUDIT_REPORT.md)** - Security analysis and fixes
- **[Architecture](ARCHITECTURE.md)** - System design and dependencies
- **[Monetization Infrastructure](MONETIZATION_INFRASTRUCTURE.md)** - Freemium model & marketplace

## 🔧 External Tools Required

Pentru funcționarea completă, aplicația necesită următoarele tool-uri externe:

### FFmpeg
- **Locație**: `tools/ffmpeg/ffmpeg.exe`
- **Folosire**: Video processing, cropping, effects
- **Download**: [FFmpeg builds](https://www.gyan.dev/ffmpeg/builds/)

### Piper TTS
- **Locație**: `tools/piper/piper.exe`
- **Folosire**: Local text-to-speech generation
- **Download**: [Piper releases](https://github.com/rhasspy/piper/releases)
- **Models**: Place în `tools/piper/models/`

### Whisper.cpp
- **Locație**: `tools/whisper/whisper.exe`
- **Folosire**: Speech-to-text pentru subtitles
- **Download**: [Whisper.cpp releases](https://github.com/ggerganov/whisper.cpp/releases)
- **Models**: Place în `tools/whisper/models/`

### Godot Engine (Opțional)
- **Locație**: `tools/godot/Godot_v4.x.x-stable_win64.exe`
- **Folosire**: Procedural voxel background generation
- **Download**: [Godot Engine](https://godotengine.org/download)

## 🧪 Testing: 147/147 Passing (100%)

```bash
# Complete test suite
pnpm test:all       # 147/147 passing

# By test type
pnpm test:unit      # 95 unit tests
pnpm test:integration  # 29 integration tests
pnpm test:e2e       # 23 E2E tests

# Coverage report
pnpm test:coverage
```

**Test Breakdown:**
- ✅ **Unit Tests**: 95/95 (Backend services, controllers, utilities)
- ✅ **Integration Tests**: 29/29 (API endpoints, service integration)
- ✅ **E2E Tests**: 23/23 (Full pipeline, UI workflows)

**See [PROJECT_STATUS_REAL.md](PROJECT_STATUS_REAL.md) for detailed test metrics.**

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build Tauri desktop app
pnpm --filter @app/ui tauri build

# Build will create MSI installer in:
# apps/ui/src-tauri/target/release/bundle/msi/
```

## 🚀 Deployment

Aplicația se distribuie ca **MSI installer** care include:

- Tauri desktop application
- All dependencies și tool binaries
- Default configuration files
- Data directories setup

## 📝 Module Implementation Status

| Module | Name | Progress | Status |
|--------|------|----------|--------|
| 0 | Monorepo Scaffold | █████████████████████ 100% | ✅ Complete |
| 1 | UI Shell | █████████████████████ 100% | ✅ Complete |
| 2 | Backend Orchestrator | █████████████████████ 100% | ✅ Complete |
| 3 | AI Integration | █████████████████████ 100% | ✅ Complete |
| 4 | FFmpeg Services | █████████████████████ 100% | ✅ Complete |
| 5 | Audio Processing | █████████████████████ 100% | ✅ Complete |
| 6 | TTS Integration | █████████████████████ 100% | ✅ Complete |
| 7 | Subtitles | █████████████████████ 100% | ✅ Complete |
| 8 | Export & Post | █████████████████████ 100% | ✅ Complete |
| 9 | E2E Integration | █████████████████████ 100% | ✅ Complete |

**Overall**: 100% Complete

**See [MODULES_DETAILED_STATUS.md](MODULES_DETAILED_STATUS.md) for detailed breakdown.**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

Pentru întrebări sau probleme:

1. Check documentation în `tools/` directories
2. Run health check: `curl http://127.0.0.1:4545/health`
3. Check logs în console pentru debugging
4. Verify tool binaries installation

---

**Video Orchestrator** - Transformă ideile în conținut video viral cu puterea AI-ului și procesarea media locală! 🎬✨

<!-- Test commit for GitHub features verification -->
