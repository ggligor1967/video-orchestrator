# Video Orchestrator Backend - API Documentation

## Overview

Backend-ul Video Orchestrator este un server Express.js care furnizează API-uri pentru procesarea video, generarea de conținut AI și managementul asset-urilor pentru aplicația desktop Video Orchestrator.

## Arhitectura Backend-ului

### Structura de Directoare
```
apps/orchestrator/src/
├── server.js              # Server principal Express
├── routes/                # Definițiile rutelor API
│   ├── health.js          # Health check
│   ├── ai.js             # Generare scripturi AI
│   ├── assets.js         # Management backgrounds
│   ├── video.js          # Procesare video
│   ├── audio.js          # Procesare audio
│   ├── tts.js            # Text-to-speech
│   ├── subs.js           # Generare subtitrări
│   ├── export.js         # Export video final
│   └── pipeline.js       # Pipeline end-to-end
├── controllers/          # Logica de control și validare
├── services/             # Logica de business
├── middleware/           # Middleware-uri custom
└── utils/               # Utilitare (logger, helpers)
```

### Servicii Implementate

#### 1. AI Service (`aiService.js`)
- **Scop**: Generarea de scripturi folosind OpenAI/Gemini
- **Endpoint**: `POST /ai/script`
- **Features**: 
  - Suport pentru multiple genuri (horror, mystery, paranormal, true crime)
  - Fallback între OpenAI și Gemini
  - Mock responses pentru development
  - Rate limiting și retry logic

#### 2. Assets Service (`assetsService.js`)
- **Scop**: Management-ul video backgrounds
- **Endpoints**: 
  - `GET /assets/backgrounds` - Lista backgrounds
  - `POST /assets/backgrounds/import` - Import video nou
  - `DELETE /assets/backgrounds/:id` - Ștergere background
- **Features**: Upload multer, validare format video, info extragere FFmpeg

#### 3. FFmpeg Service (`ffmpegService.js`)
- **Scop**: Procesarea video/audio cu FFmpeg
- **Operații**:
  - Crop la 9:16 aspect ratio
  - Speed ramp effects
  - Audio normalization (-16 LUFS)
  - Video-audio merging
  - Subtitle burn-in
  - Export cu presets (TikTok, YouTube, Instagram)

#### 4. TTS Service (`ttsService.js`)
- **Scop**: Generarea voice-over cu Piper TTS
- **Endpoint**: `POST /tts/generate`
- **Features**:
  - Multiple voci (en_US-lessac, en_US-amy, en_GB-alan)
  - Control viteză vorbire
  - Fallback la mock pentru development

#### 5. Subtitles Service (`subsService.js`)
- **Scop**: Generarea subtitles cu Whisper.cpp
- **Endpoints**:
  - `POST /subs/generate` - Generare din audio
  - `POST /subs/format` - Formatare (SRT, VTT, ASS)
- **Features**: Transcripție automată, multiple formate output

#### 6. Export Service (`exportService.js`)
- **Scop**: Compilarea finală a video-urilor
- **Endpoint**: `POST /export/compile`
- **Features**:
  - Presets optimizate pentru platforme
  - Efecte (progress bar, part badge, watermark)
  - Merge video+audio+subtitles

#### 7. Pipeline Service (`pipelineService.js`)
- **Scop**: Orchestrarea end-to-end
- **Endpoint**: `POST /pipeline/build`
- **Features**:
  - Job tracking cu status
  - Pipeline în 4 etape: video processing → TTS → subtitles → compilation
  - Progress monitoring
  - Error handling și cleanup

## Configurația Serverului

### Port și Networking
- **Port**: `4545` (hardcoded pentru consistență)
- **Host**: `127.0.0.1` (localhost only)
- **CORS**: Configurat pentru Tauri (`http://localhost:1420`, `tauri://localhost`)

### Middleware Stack
- **Helmet**: Security headers
- **CORS**: Cross-origin pentru Tauri frontend
- **Morgan**: HTTP request logging
- **Express JSON**: Body parsing (50MB limit pentru video uploads)
- **Static Files**: Servește `/data` la endpoint `/static`

### Error Handling
- **Zod Validation**: Validare input la controller level
- **Winston Logging**: Structured logging cu rotate files
- **Error Middleware**: Responses JSON consistente

## API Endpoints Summary

### Core Endpoints
```
GET  /health                    # System health check
POST /ai/script                 # Generate story script
```

### Asset Management
```
GET    /assets/backgrounds      # List video backgrounds
POST   /assets/backgrounds/import  # Upload new background
DELETE /assets/backgrounds/:id  # Delete background
GET    /assets/backgrounds/:id/info # Get background info
```

### Media Processing
```
POST /video/crop               # Crop to 9:16 vertical
POST /video/speed-ramp         # Apply progressive zoom
POST /video/merge-audio        # Merge video with audio
POST /audio/normalize          # Audio loudness normalization
POST /audio/mix                # Mix multiple audio sources
```

### Content Generation
```
POST /tts/generate             # Generate voice-over
GET  /tts/voices               # List available voices
POST /subs/generate            # Generate subtitles from audio
POST /subs/format              # Format subtitles (SRT/VTT/ASS)
```

### Export & Pipeline
```
POST /export/compile           # Compile final video
GET  /export/presets           # Available export presets
POST /pipeline/build           # End-to-end video creation
GET  /pipeline/status/:jobId   # Check pipeline job status
```

## File Organization Patterns

### Input/Output Directories
- `data/assets/backgrounds/` - Imported background videos
- `data/cache/` - Temporary processing files
- `data/tts/` - Generated voice audio files
- `data/subs/` - Subtitle files (.srt, .vtt, .ass)
- `data/exports/` - Final compiled videos

### Naming Conventions
- **Controllers**: `*Controller.js` (camelCase)
- **Services**: `*Service.js` (camelCase)
- **Routes**: lowercase plural (`assets.js`, not `asset.js`)
- **Generated Files**: Timestamp-based pentru uniqueness

### Validation Patterns
- **Zod Schemas**: Definite în controllers pentru input validation
- **File Type Validation**: În multer configuration
- **Business Logic Validation**: În services

## External Tool Integration

### FFmpeg Integration
- **Binary Path**: `tools/ffmpeg/bin/ffmpeg.exe`
- **Operations**: Video crop, speed effects, audio normalization, merging
- **Error Handling**: Comprehensive error capture și logging

### Piper TTS Integration
- **Binary Path**: `tools/piper/bin/piper.exe`
- **Models**: `tools/piper/models/*.onnx`
- **Fallback**: Mock TTS pentru development fără binary

### Whisper.cpp Integration
- **Binary Path**: `tools/whisper/bin/main.exe`
- **Model**: `tools/whisper/models/ggml-base.en.bin`
- **Output**: Direct SRT format generation

## Development și Testing

### Environment Setup
```bash
cd apps/orchestrator
pnpm install
pnpm dev  # Start cu nodemon
```

### Mock Mode
- Backend-ul funcționează fără external tools pentru development
- AI services au mock responses când API keys nu sunt configurate
- TTS și Whisper generează placeholder files

### Logging
- **Winston Logger**: Structured JSON logging
- **File Outputs**: `error.log`, `combined.log`
- **Console**: Colorized output în development

## Status: ✅ BACKEND COMPLET IMPLEMENTAT

Toate serviciile, rutele și controller-ele sunt implementate conform specificațiilor din documentația Video Orchestrator. Backend-ul este gata pentru integrare cu frontend-ul Tauri + Svelte.

### Next Steps pentru Alți Agenți:
1. **Frontend Implementation**: Crearea aplicației Tauri + Svelte
2. **Shared Packages**: Types și schemas comune
3. **Integration Testing**: Testarea end-to-end a pipeline-ului
4. **Tool Binaries**: Integrarea FFmpeg, Piper, Whisper executables