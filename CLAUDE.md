# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Video Orchestrator** is a desktop-first Windows application for creating automated vertical videos (TikTok/Shorts/Reels). It combines AI-generated scripts with local media processing to create complete video content with backgrounds, voice-overs, audio, and subtitles.

This is a **pnpm monorepo** with a Node.js Express backend and a Tauri + Svelte desktop frontend.

## Development Commands

### Starting the Application

```bash
# Install dependencies (required first time)
pnpm install

# Build shared packages first (required before first dev run)
pnpm --filter @video-orchestrator/shared build

# Start both backend and frontend in development mode
pnpm dev

# Start backend only (runs on port 4545)
pnpm --filter @app/orchestrator dev

# Start frontend only (runs on port 5173)
pnpm --filter @app/ui dev
```

### Testing

```bash
# Run all tests
pnpm test:all

# Run specific test suites
pnpm test:unit            # Unit tests only
pnpm test:integration     # Integration tests (requires backend running)
pnpm test:e2e:ui          # End-to-end UI tests (Playwright)
pnpm test:e2e:cli         # End-to-end CLI tests
pnpm test:media           # Media validation tests
pnpm test:release         # Critical tests for release (unit + integration + media)
```

### Building

```bash
# Build all packages
pnpm build

# Build Tauri desktop app (creates MSI installer)
pnpm --filter @app/ui tauri build

# The MSI will be in: apps/ui/src-tauri/target/release/bundle/msi/
```

### Linting

```bash
# Check for linting issues
pnpm lint

# Fix linting issues automatically
pnpm lint:fix
```

## Architecture

### Monorepo Structure

```
├── apps/
│   ├── orchestrator/        # Express.js backend (port 4545)
│   │   ├── src/
│   │   │   ├── routes/      # API route definitions
│   │   │   ├── controllers/ # Request handlers with validation
│   │   │   ├── services/    # Business logic
│   │   │   ├── container/   # Dependency injection container
│   │   │   ├── config/      # Configuration management
│   │   │   ├── middleware/  # Custom middleware
│   │   │   ├── utils/       # Helper functions (logger, etc)
│   │   │   ├── app.js       # Express app factory
│   │   │   └── server.js    # Server entry point
│   └── ui/                  # Tauri + Svelte frontend
│       ├── src/
│       │   ├── components/tabs/  # 6-tab interface components
│       │   ├── stores/      # Svelte stores for state
│       │   └── lib/         # API client
│       └── src-tauri/       # Tauri configuration
├── packages/
│   └── shared/              # Common types and utilities
│       ├── src/
│       │   ├── types.ts     # TypeScript interfaces
│       │   ├── schemas.ts   # Zod validation schemas
│       │   └── utils.ts     # Shared utilities
├── tools/                   # External tool binaries
│   ├── ffmpeg/              # Video/audio processing
│   ├── piper/               # Local TTS (Piper models)
│   ├── whisper/             # Speech-to-text (Whisper models)
│   └── godot/               # Voxel background generator
├── data/                    # Media assets and outputs
│   ├── assets/backgrounds/  # Video backgrounds
│   ├── cache/               # Temporary processing files
│   ├── tts/                 # Generated voice files
│   ├── subs/                # Subtitle files (.srt)
│   └── exports/             # Final video outputs
└── tests/                   # Test files
```

### Backend Architecture (apps/orchestrator)

**Port:** Runs on `4545` by default (configurable via `PORT` environment variable)

**Architecture Pattern:** Dependency Injection with container-based architecture
- **Container:** Centralized service registration and resolution
- **Configuration:** Environment-based config management with defaults
- **Layered architecture:** Routes → Controllers → Services

**Key Services:**
- `aiService.js` - AI script generation (OpenAI/Gemini) + virality scoring
- `ffmpegService.js` - Video/audio processing + auto-reframe
- `ttsService.js` - Text-to-speech with Piper
- `subsService.js` - Subtitle generation with Whisper
- `exportService.js` - Final video compilation
- `pipelineService.js` - End-to-end automation
- `batchService.js` - Batch processing for multiple videos
- `schedulerService.js` - Social media post scheduling (cron-based)

**Validation:** Uses Zod schemas at controller level

**Static Files:** Serves `data/` directory at `/static` endpoint

**Configuration:** Managed via `config/config.js` with environment variables support

### Frontend Architecture (apps/ui)

**Framework:** Tauri + Svelte

**Communication:** HTTP API calls to `http://127.0.0.1:4545`

**6-Tab Interface:**
1. Story & Script - AI script generation
2. Background - Video import and selection
3. Voice-over - TTS generation with multiple voices
4. Audio & SFX - Audio mixing and effects
5. Subtitles - Subtitle generation and editing
6. Export & Post - Final video export

**Auto-advance:** Automatically advances to next tab when current task is complete

**State Management:** Project context stored in Svelte stores, tracking file paths and processing state across tabs

## API Endpoints

All endpoints are on `http://127.0.0.1:4545`

### Core
- `GET /health` - System health check
- `POST /ai/script` - Generate story script
- `POST /ai/background-suggestions` - Get AI background suggestions
- `POST /ai/virality-score` - Calculate virality score prediction

### Asset Management
- `GET /assets/backgrounds` - List video backgrounds
- `POST /assets/backgrounds/import` - Upload new background
- `DELETE /assets/backgrounds/:id` - Delete background
- `GET /assets/backgrounds/:id/info` - Get background info

### Media Processing
- `POST /video/crop` - Crop to 9:16 vertical (with smart crop options)
- `POST /video/auto-reframe` - AI-powered auto-reframe (face/motion/center)
- `POST /video/speed-ramp` - Apply progressive zoom
- `POST /video/merge-audio` - Merge video with audio
- `POST /audio/normalize` - Audio loudness normalization
- `POST /audio/mix` - Mix multiple audio sources

### Content Generation
- `POST /tts/generate` - Generate voice-over
- `GET /tts/voices` - List available voices
- `POST /subs/generate` - Generate subtitles from audio
- `POST /subs/format` - Format subtitles (SRT/VTT/ASS)

### Export & Pipeline
- `POST /export/compile` - Compile final video
- `GET /export/presets` - Available export presets
- `POST /pipeline/build` - End-to-end video creation
- `GET /pipeline/status/:jobId` - Check pipeline job status

### Batch Processing
- `POST /batch` - Create batch job (up to 50 videos)
- `GET /batch` - List all batch jobs
- `GET /batch/:batchId` - Get batch job status
- `POST /batch/:batchId/cancel` - Cancel batch job
- `DELETE /batch/:batchId` - Delete batch job

### Social Media Scheduler
- `POST /scheduler` - Schedule a post
- `GET /scheduler` - List all scheduled posts
- `GET /scheduler/upcoming` - Get upcoming posts
- `GET /scheduler/:postId` - Get scheduled post details
- `PUT /scheduler/:postId` - Update scheduled post
- `POST /scheduler/:postId/cancel` - Cancel scheduled post
- `DELETE /scheduler/:postId` - Delete scheduled post

## Coding Conventions

### File Organization
- **Controllers:** Input validation + response formatting (uses Zod schemas)
- **Services:** Business logic + external tool integration
- **Routes:** Lowercase plural nouns (`assets.js`, not `asset.js`)
- **Controllers/Services:** camelCase with suffix (`aiController.js`, `ffmpegService.js`)
- **Tests:** Co-located with source, named `*.test.js`

### Media Processing Standards
- **Video Format:** Vertical 9:16 aspect ratio, 1080×1920, 30fps
- **Audio:** Loudness normalization (-16 LUFS, peak ≤ -1 dB), AAC 192kbps
- **Export Presets:**
  - TikTok: 8Mbps video
  - YouTube Shorts: 12Mbps video
  - Instagram Reels: 8Mbps video

### Error Handling
- Zod schemas for input validation at controller level
- Consistent JSON error format: `{ error: string }`
- Retry logic for AI services (exponential backoff)
- Comprehensive error capture and logging with Winston

### External Tools Integration
- **FFmpeg:** `tools/ffmpeg/ffmpeg.exe` - Video/audio processing
- **Piper TTS:** `tools/piper/piper.exe` + models in `tools/piper/models/`
- **Whisper.cpp:** `tools/whisper/whisper.exe` + models in `tools/whisper/models/`
- **Godot Engine:** `tools/godot/Godot_v4.x.x-stable_win64.exe` (optional, for voxel backgrounds)

All tools have mock fallbacks for development without binaries installed.

## Important Notes

- **Platform:** Windows-first design, distributed as MSI installer
- **Backend Port:** Default is `4545` (configurable via `PORT` environment variable)
- **Language:** Documentation is in Romanian, but code and comments are in English
- **Package Manager:** pnpm with workspaces (not npm or yarn)
- **Local-First:** All media processing happens locally; AI is the only cloud dependency
- **Shared Package:** Always build `@video-orchestrator/shared` first before starting development
- **Module System:** Project follows a 0-9 module implementation structure (see `assets/` for detailed specs)
- **Dependency Injection:** Backend uses container-based DI pattern for service management
