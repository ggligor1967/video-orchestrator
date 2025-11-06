# 🎯 Video Orchestrator - Roadmap de Implementare

**Versiune**: 1.0.0  
**Data ultimei actualizări**: 02 noiembrie 2025  
**Status**: ✅ Faza 0 completă - Infrastructure & UI Shell  

---

## 📊 Status Curent

### ✅ Completat (Faza 0)
- [x] **Monorepo Setup** - pnpm workspaces configurat
- [x] **Backend Core** - Server Express pe portul 4545
- [x] **API Structure** - Toate endpoint-urile definite și testate
- [x] **UI Shell** - Tauri v2 + Svelte 5 cu 9 tab-uri funcționale
- [x] **Navigation** - Tab switching și workflow management
- [x] **Build System** - MSI installer (2.15 MB) funcțional
- [x] **Unit Tests** - 51/51 teste backend passing (100%)

### 🔄 În Lucru
- [ ] Tool Integration (FFmpeg, Piper, Whisper, Godot)
- [ ] AI Service Implementation (OpenAI/Gemini)
- [ ] Media Processing Pipeline

### ⏳ Planificat
- [ ] Advanced Features (Batch, Queue, Scheduler)
- [ ] Performance Optimization
- [ ] Production Release

---

## 🗓️ Timeline General

| Fază | Durată | Status | Completare |
|------|--------|--------|------------|
| Faza 0: Infrastructure | 5 zile | ✅ Complete | 100% |
| Faza 1: Tool Integration | 3-5 zile | 📋 Pending | 0% |
| Faza 2: Core Features | 5-7 zile | 📋 Pending | 0% |
| Faza 3: Advanced Features | 4-5 zile | 📋 Pending | 0% |
| Faza 4: Polish & Release | 3-4 zile | 📋 Pending | 0% |

**Total Estimat**: 15-20 zile lucrătoare

---

## 📋 FAZA 1: Tool Integration & Setup (3-5 zile)

**Obiectiv**: Setup complet al tuturor binarelor necesare pentru procesare media

### Sprint 1.1: Binary Tools Download & Setup (2 zile)

#### 1.1.1 FFmpeg Setup
```bash
# Download
URL: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

# Structură finală
tools/ffmpeg/
├── bin/
│   ├── ffmpeg.exe
│   ├── ffprobe.exe
│   └── ffplay.exe
├── LICENSE.txt
└── README.md
```

**Checklist**:
- [ ] Download FFmpeg essentials build (latest stable)
- [ ] Extract la `tools/ffmpeg/`
- [ ] Verificare `ffmpeg.exe -version`
- [ ] Test basic operation: `ffmpeg -i test.mp4 -vcodec copy test_copy.mp4`
- [ ] Update `healthService.js` cu path corect

#### 1.1.2 Piper TTS Setup
```bash
# Download
URL: https://github.com/rhasspy/piper/releases/latest

# Structură finală
tools/piper/
├── bin/
│   └── piper.exe
├── models/
│   ├── en_US-libritts-high.onnx
│   ├── en_US-libritts-high.onnx.json
│   ├── ro_RO-mihai-medium.onnx
│   └── ro_RO-mihai-medium.onnx.json
└── README.md
```

**Checklist**:
- [ ] Download Piper Windows build
- [ ] Extract la `tools/piper/bin/`
- [ ] Download voice models: `en_US-libritts-high`, `ro_RO-mihai-medium`
- [ ] Test TTS: `echo "Hello" | piper.exe --model en_US-libritts-high.onnx --output test.wav`
- [ ] Verificare calitate audio generat
- [ ] Update `ttsService.js` cu path-uri corecte

#### 1.1.3 Whisper.cpp Setup
```bash
# Download
URL: https://github.com/ggerganov/whisper.cpp/releases/latest

# Structură finală
tools/whisper/
├── bin/
│   └── main.exe
├── models/
│   ├── ggml-base.bin
│   └── ggml-medium.bin
└── README.md
```

**Checklist**:
- [ ] Download whisper.cpp Windows build
- [ ] Extract la `tools/whisper/bin/`
- [ ] Download models: `base`, `medium`
- [ ] Test transcription: `main.exe -m ggml-base.bin -f test.wav`
- [ ] Verificare accuracy subtitrări
- [ ] Update `subtitleService.js`

#### 1.1.4 Godot Setup (Optional pentru Faza 1)
```bash
# Download
URL: https://godotengine.org/download/windows

# Structură finală
tools/godot/
├── bin/
│   └── godot.exe
├── projects/
│   └── voxel-generator/
│       ├── project.godot
│       ├── scenes/
│       └── scripts/
└── README.md
```

**Checklist**:
- [ ] Download Godot 4.x stable
- [ ] Extract la `tools/godot/bin/`
- [ ] Create project template pentru voxel backgrounds
- [ ] Test export video: `godot --export-video output.mp4`
- [ ] Update `godotService.js`

### Sprint 1.2: Configuration & Environment (1 zi)

#### 1.2.1 Environment Variables
```javascript
// apps/orchestrator/.env
NODE_ENV=development
PORT=4545

# AI Configuration
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...

# Tool Paths (relative la project root)
FFMPEG_PATH=../../tools/ffmpeg/bin/ffmpeg.exe
FFPROBE_PATH=../../tools/ffmpeg/bin/ffprobe.exe
PIPER_PATH=../../tools/piper/bin/piper.exe
WHISPER_PATH=../../tools/whisper/bin/main.exe
GODOT_PATH=../../tools/godot/bin/godot.exe

# Piper Models
PIPER_MODEL_EN=../../tools/piper/models/en_US-libritts-high.onnx
PIPER_MODEL_RO=../../tools/piper/models/ro_RO-mihai-medium.onnx

# Whisper Models
WHISPER_MODEL_BASE=../../tools/whisper/models/ggml-base.bin
WHISPER_MODEL_MEDIUM=../../tools/whisper/models/ggml-medium.bin

# Processing Settings
MAX_VIDEO_DURATION=60
DEFAULT_VIDEO_FPS=30
DEFAULT_VIDEO_RESOLUTION=1080x1920
AUDIO_LOUDNESS_TARGET=-16
AUDIO_PEAK_TARGET=-1.5

# Cache & Export
CACHE_DIR=../../data/cache
EXPORTS_DIR=../../data/exports
ASSETS_DIR=../../data/assets
```

**Checklist**:
- [ ] Create `.env` file în `apps/orchestrator/`
- [ ] Add `.env` la `.gitignore`
- [ ] Create `.env.example` cu placeholder values
- [ ] Setup `dotenv` în `server.js`
- [ ] Validate all paths exist at startup

#### 1.2.2 Health Check Service Update
```javascript
// apps/orchestrator/src/services/healthService.js

const checkBinaries = () => {
  const binaries = {
    ffmpeg: {
      path: process.env.FFMPEG_PATH,
      available: false,
      version: null,
      error: null
    },
    piper: {
      path: process.env.PIPER_PATH,
      available: false,
      version: null,
      error: null
    },
    whisper: {
      path: process.env.WHISPER_PATH,
      available: false,
      version: null,
      error: null
    },
    godot: {
      path: process.env.GODOT_PATH,
      available: false,
      version: null,
      error: null
    }
  };

  // Check each binary
  for (const [name, info] of Object.entries(binaries)) {
    try {
      if (fs.existsSync(info.path)) {
        info.available = true;
        info.version = getBinaryVersion(name, info.path);
      } else {
        info.error = 'Binary not found';
      }
    } catch (error) {
      info.error = error.message;
    }
  }

  return binaries;
};
```

**Checklist**:
- [ ] Update `checkBinaries()` cu toate tool-urile
- [ ] Add version detection pentru fiecare binary
- [ ] Test health endpoint: `GET /health`
- [ ] Verify UI shows correct binary status
- [ ] Document binary requirements în README

### Sprint 1.3: Data Directory Structure (1 zi)

```bash
data/
├── cache/              # Temporary processing files
│   ├── ai/            # Generated scripts
│   ├── tts/           # Voice-over audio
│   ├── video/         # Processed videos
│   └── subs/          # Subtitle files
├── assets/            # User uploaded media
│   ├── backgrounds/   # Video backgrounds
│   │   ├── imported/  # User imports
│   │   └── obs/       # OBS recordings
│   └── audio/         # Music & SFX
└── exports/           # Final videos
    ├── tiktok/
    ├── youtube/
    └── instagram/
```

**Checklist**:
- [ ] Create directory structure
- [ ] Add `.gitkeep` în fiecare subdirectory
- [ ] Add `.gitignore` pentru cache și exports
- [ ] Setup cleanup service pentru cache vechi (>7 zile)
- [ ] Test write permissions pentru toate directoarele

---

## 📋 FAZA 2: Core Features Implementation (5-7 zile)

**Obiectiv**: Implementare funcționalitate AI și procesare media de bază

### Sprint 2.1: AI Script Generation (2 zile)

#### 2.1.1 OpenAI Integration
```javascript
// apps/orchestrator/src/services/aiService.js

import OpenAI from 'openai';

class AIService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.gemini = null; // TODO: Gemini setup
  }

  async generateScript(topic, genre, options = {}) {
    const systemPrompt = this.buildSystemPrompt(genre);
    const userPrompt = this.buildUserPrompt(topic, options);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      const content = response.choices[0].message.content;
      return this.parseResponse(content);

    } catch (error) {
      logger.error('OpenAI generation failed:', error);
      
      // Fallback to Gemini if available
      if (this.gemini) {
        return await this.generateWithGemini(topic, genre, options);
      }
      
      throw error;
    }
  }

  buildSystemPrompt(genre) {
    const prompts = {
      horror: `You are a horror story writer for short-form vertical videos (TikTok/Shorts). 
Create atmospheric, suspenseful narratives under 60 seconds when spoken. 
Focus on building tension quickly with vivid descriptions.`,
      
      mystery: `You are a mystery story writer for short-form vertical videos.
Create intriguing narratives with unexpected twists under 60 seconds when spoken.
Keep viewers engaged with cliffhangers and revelations.`,
      
      paranormal: `You are a paranormal story writer for short-form vertical videos.
Create eerie, supernatural narratives under 60 seconds when spoken.
Use atmospheric descriptions and build suspense gradually.`,
      
      'true crime': `You are a true crime narrator for short-form vertical videos.
Present real criminal cases dramatically under 60 seconds when spoken.
Focus on the most compelling aspects and maintain objectivity.`
    };

    return prompts[genre] || prompts.horror;
  }

  buildUserPrompt(topic, options) {
    return `Create a ${options.duration || 45}-second script about: "${topic}"

Requirements:
- Start with a powerful hook in the first 3 seconds
- Use vivid, visual language suitable for video
- Include dramatic pauses (marked with ...)
- End with a cliffhanger or thought-provoking question
- Keep sentences short and punchy (max 15 words)
- Total word count: 100-120 words

Format your response as:
SCRIPT:
[Your script here]

HOOKS:
- [Hook option 1]
- [Hook option 2]
- [Hook option 3]

HASHTAGS:
#hashtag1 #hashtag2 #hashtag3`;
  }

  parseResponse(content) {
    const sections = {
      script: '',
      hooks: [],
      hashtags: []
    };

    // Parse script section
    const scriptMatch = content.match(/SCRIPT:\s*([\s\S]*?)(?=HOOKS:|$)/i);
    if (scriptMatch) {
      sections.script = scriptMatch[1].trim();
    }

    // Parse hooks
    const hooksMatch = content.match(/HOOKS:\s*([\s\S]*?)(?=HASHTAGS:|$)/i);
    if (hooksMatch) {
      sections.hooks = hooksMatch[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(hook => hook.length > 0);
    }

    // Parse hashtags
    const hashtagsMatch = content.match(/HASHTAGS:\s*([\s\S]*?)$/i);
    if (hashtagsMatch) {
      sections.hashtags = hashtagsMatch[1]
        .match(/#\w+/g) || [];
    }

    return {
      ...sections,
      duration: this.estimateDuration(sections.script),
      wordCount: sections.script.split(/\s+/).length,
      generatedAt: new Date().toISOString()
    };
  }

  estimateDuration(text) {
    // Average speaking rate: 150 words per minute
    const words = text.split(/\s+/).length;
    return Math.ceil((words / 150) * 60);
  }
}
```

**Checklist**:
- [ ] Install `openai` package
- [ ] Create `AIService` class
- [ ] Implement `generateScript()` method
- [ ] Add system prompts pentru fiecare genre
- [ ] Implement response parsing
- [ ] Add retry logic cu exponential backoff
- [ ] Test cu API key real
- [ ] Add usage tracking și cost estimation

#### 2.1.2 Gemini Integration (Fallback)
```javascript
// apps/orchestrator/src/services/aiService.js (continued)

import { GoogleGenerativeAI } from '@google/generative-ai';

async generateWithGemini(topic, genre, options) {
  if (!this.gemini) {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const systemPrompt = this.buildSystemPrompt(genre);
  const userPrompt = this.buildUserPrompt(topic, options);
  
  const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
  const text = result.response.text();
  
  return this.parseResponse(text);
}
```

**Checklist**:
- [ ] Install `@google/generative-ai` package
- [ ] Implement Gemini fallback
- [ ] Test cu API key real
- [ ] Compare quality cu OpenAI
- [ ] Document cost comparison

### Sprint 2.2: TTS Implementation (2 zile)

#### 2.2.1 Piper TTS Service
```javascript
// apps/orchestrator/src/services/ttsService.js

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class TTSService {
  async generateVoiceOver(text, options = {}) {
    const {
      voice = 'en_US',
      speed = 1.0,
      outputPath = null
    } = options;

    const modelPath = voice === 'en_US' 
      ? process.env.PIPER_MODEL_EN 
      : process.env.PIPER_MODEL_RO;

    const output = outputPath || path.join(
      process.env.CACHE_DIR,
      'tts',
      `voice_${Date.now()}.wav`
    );

    // Ensure output directory exists
    await fs.mkdir(path.dirname(output), { recursive: true });

    // Run Piper TTS
    const command = `echo "${this.escapeText(text)}" | "${process.env.PIPER_PATH}" --model "${modelPath}" --output_file "${output}" --length_scale ${1.0 / speed}`;

    try {
      await execAsync(command);
      
      // Post-process audio
      const normalized = await this.normalizeAudio(output);
      
      // Get duration
      const duration = await this.getAudioDuration(normalized);

      return {
        path: normalized,
        duration,
        voice,
        speed,
        text,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('TTS generation failed:', error);
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  async normalizeAudio(inputPath) {
    const outputPath = inputPath.replace('.wav', '_norm.wav');

    const command = `"${process.env.FFMPEG_PATH}" -i "${inputPath}" -af "loudnorm=I=${process.env.AUDIO_LOUDNESS_TARGET}:TP=${process.env.AUDIO_PEAK_TARGET}:LRA=11,highpass=f=80,lowpass=f=15000" -ar 44100 -y "${outputPath}"`;

    await execAsync(command);
    
    // Replace original
    await fs.rename(outputPath, inputPath);
    
    return inputPath;
  }

  async getAudioDuration(audioPath) {
    const command = `"${process.env.FFPROBE_PATH}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    
    const { stdout } = await execAsync(command);
    return parseFloat(stdout.trim());
  }

  escapeText(text) {
    return text.replace(/"/g, '\\"');
  }
}
```

**Checklist**:
- [ ] Implement `generateVoiceOver()` method
- [ ] Add audio normalization cu FFmpeg
- [ ] Implement duration detection
- [ ] Test cu diferite voice models
- [ ] Add progress callback pentru UI
- [ ] Test cu text lung (>500 cuvinte)
- [ ] Optimize quality vs speed

### Sprint 2.3: Video Processing Pipeline (3 zile)

#### 2.3.1 Background Processing
```javascript
// apps/orchestrator/src/services/videoService.js

class VideoService {
  async processBackground(inputPath, options = {}) {
    const {
      targetDuration = 60,
      targetResolution = '1080x1920',
      targetFps = 30
    } = options;

    const outputPath = path.join(
      process.env.CACHE_DIR,
      'video',
      `bg_${Date.now()}.mp4`
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Crop to 9:16 and apply effects
    const filters = [
      // Crop to center 9:16
      'crop=ih*9/16:ih',
      // Scale to target resolution
      `scale=${targetResolution}`,
      // Apply speed ramp (zoom effect after 2 seconds)
      this.createSpeedRampFilter(targetDuration)
    ];

    const command = `"${process.env.FFMPEG_PATH}" -i "${inputPath}" -vf "${filters.join(',')}" -r ${targetFps} -c:v libx264 -preset medium -crf 23 -y "${outputPath}"`;

    await execAsync(command);

    return {
      path: outputPath,
      duration: await this.getVideoDuration(outputPath),
      resolution: targetResolution,
      fps: targetFps
    };
  }

  createSpeedRampFilter(duration) {
    // Progressive zoom starting at 2 seconds
    const totalFrames = duration * 30; // assuming 30fps
    return `zoompan=z='if(lte(on,60),1,min(1.5,zoom+0.001))':d=${totalFrames}:s=1080x1920`;
  }

  async getVideoDuration(videoPath) {
    const command = `"${process.env.FFPROBE_PATH}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    
    const { stdout } = await execAsync(command);
    return parseFloat(stdout.trim());
  }
}
```

**Checklist**:
- [ ] Implement `processBackground()` cu crop și scale
- [ ] Add progressive zoom effect
- [ ] Implement duration detection
- [ ] Test cu diferite aspect ratios input
- [ ] Optimize encoding settings (CRF, preset)
- [ ] Add progress callback

#### 2.3.2 Video Composition
```javascript
// apps/orchestrator/src/services/videoService.js (continued)

async compositeVideo(layers) {
  const {
    background,
    audio,
    subtitles = null,
    overlays = {}
  } = layers;

  const outputPath = path.join(
    process.env.EXPORTS_DIR,
    `video_${Date.now()}.mp4`
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Build complex filter
  const filters = [];

  // Add subtitle burn-in if provided
  if (subtitles) {
    filters.push(`subtitles='${subtitles}':force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2'`);
  }

  // Add progress bar overlay
  if (overlays.progressBar) {
    filters.push(this.createProgressBarFilter());
  }

  // Add part badge
  if (overlays.partNumber) {
    filters.push(this.createPartBadgeFilter(overlays.partNumber));
  }

  const filterString = filters.length > 0 ? `-vf "${filters.join(',')}"` : '';

  const command = `"${process.env.FFMPEG_PATH}" -i "${background}" -i "${audio}" ${filterString} -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -shortest -y "${outputPath}"`;

  await execAsync(command);

  return {
    path: outputPath,
    size: (await fs.stat(outputPath)).size,
    duration: await this.getVideoDuration(outputPath)
  };
}

createProgressBarFilter() {
  // Bottom progress bar
  return `drawbox=x=0:y=ih-5:w=iw*t/duration:h=5:color=0x3B82F6:t=fill`;
}

createPartBadgeFilter(partNumber) {
  // Top-left "Part N" badge
  return `drawtext=text='Part ${partNumber}':fontfile=/Windows/Fonts/arial.ttf:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:x=20:y=20`;
}
```

**Checklist**:
- [ ] Implement `compositeVideo()` method
- [ ] Add subtitle burn-in support
- [ ] Create progress bar overlay
- [ ] Create part badge overlay
- [ ] Test layering order
- [ ] Optimize encoding pentru platform-uri
- [ ] Add quality validation

---

## 📋 FAZA 3: Advanced Features (4-5 zile)

**Obiectiv**: Batch processing, scheduling, și advanced media features

### Sprint 3.1: Subtitle Generation (2 zile)

#### 3.1.1 Whisper Integration
```javascript
// apps/orchestrator/src/services/subtitleService.js

class SubtitleService {
  async generateSubtitles(audioPath, options = {}) {
    const {
      language = 'en',
      style = 'default'
    } = options;

    // Step 1: Transcribe with Whisper
    const transcription = await this.transcribe(audioPath, language);

    // Step 2: Generate SRT
    const srtContent = this.generateSRT(transcription);

    // Step 3: Apply styling
    const styledSrt = this.applyStyle(srtContent, style);

    // Save to file
    const outputPath = path.join(
      process.env.CACHE_DIR,
      'subs',
      `sub_${Date.now()}.srt`
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, styledSrt);

    return {
      path: outputPath,
      language,
      segmentCount: transcription.segments.length,
      duration: transcription.duration
    };
  }

  async transcribe(audioPath, language) {
    const command = `"${process.env.WHISPER_PATH}" -m "${process.env.WHISPER_MODEL_BASE}" -l ${language} -f "${audioPath}" --output-srt --output-json`;

    const { stdout } = await execAsync(command);
    
    // Parse Whisper JSON output
    const lines = stdout.split('\n');
    const jsonLine = lines.find(line => line.startsWith('{'));
    
    if (!jsonLine) {
      throw new Error('Failed to parse Whisper output');
    }

    return JSON.parse(jsonLine);
  }

  generateSRT(transcription) {
    let srt = '';
    
    transcription.segments.forEach((segment, index) => {
      srt += `${index + 1}\n`;
      srt += `${this.formatTime(segment.start)} --> ${this.formatTime(segment.end)}\n`;
      srt += `${segment.text.trim()}\n\n`;
    });

    return srt;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
  }

  applyStyle(srtContent, styleName) {
    // Styles defined in SRT format limitations
    // Advanced styling requires ASS format conversion
    const styles = {
      default: { fontSize: 28, color: 'white', outline: 'black' },
      dramatic: { fontSize: 32, color: 'red', outline: 'black' },
      minimal: { fontSize: 24, color: 'white', outline: 'none' }
    };

    // For now, return SRT as-is
    // TODO: Convert to ASS for advanced styling
    return srtContent;
  }
}
```

**Checklist**:
- [ ] Implement Whisper transcription
- [ ] Generate SRT format
- [ ] Add timestamp formatting
- [ ] Implement subtitle styling
- [ ] Test accuracy cu diferite accente
- [ ] Add support pentru multiple limbi
- [ ] Optimize model selection (base vs medium)

### Sprint 3.2: Batch Processing System (2 zile)

#### 3.2.1 Queue Manager
```javascript
// apps/orchestrator/src/services/batchService.js

import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';

class BatchService extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.maxWorkers = 2; // Parallel jobs
    this.activeJobs = new Map();
  }

  async addBatch(jobs) {
    const batch = {
      id: uuid(),
      jobs: jobs.map(job => ({
        ...job,
        id: uuid(),
        status: 'pending',
        progress: 0,
        error: null
      })),
      createdAt: new Date(),
      status: 'queued',
      startedAt: null,
      completedAt: null
    };

    this.queue.push(batch);
    this.emit('batch:created', batch);

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }

    return batch;
  }

  async startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    logger.info('Batch processing started');

    while (this.queue.length > 0) {
      const batch = this.queue.shift();
      await this.processBatch(batch);
    }

    this.processing = false;
    logger.info('Batch processing completed');
  }

  async processBatch(batch) {
    batch.status = 'processing';
    batch.startedAt = new Date();
    this.emit('batch:started', batch);

    // Process jobs in parallel (limited by maxWorkers)
    const pendingJobs = [...batch.jobs];
    
    while (pendingJobs.length > 0) {
      // Get next chunk of jobs
      const chunk = pendingJobs.splice(0, this.maxWorkers);
      
      // Process chunk in parallel
      await Promise.allSettled(
        chunk.map(job => this.processJob(job, batch))
      );
    }

    // Update batch status
    const failed = batch.jobs.filter(j => j.status === 'failed').length;
    const completed = batch.jobs.filter(j => j.status === 'completed').length;

    batch.status = failed > 0 ? 'partial' : 'completed';
    batch.completedAt = new Date();
    batch.summary = {
      total: batch.jobs.length,
      completed,
      failed
    };

    this.emit('batch:completed', batch);
  }

  async processJob(job, batch) {
    job.status = 'processing';
    this.activeJobs.set(job.id, job);
    this.emit('job:started', { batchId: batch.id, job });

    try {
      // Full pipeline for single video
      logger.info(`Processing job ${job.id}: ${job.topic}`);

      // 1. Generate script
      this.updateJobProgress(job, batch, 10, 'Generating script...');
      const script = await aiService.generateScript(job.topic, job.genre);

      // 2. Generate voice-over
      this.updateJobProgress(job, batch, 30, 'Generating voice-over...');
      const voiceOver = await ttsService.generateVoiceOver(script.script, {
        voice: job.voice,
        speed: job.speed || 1.0
      });

      // 3. Process background
      this.updateJobProgress(job, batch, 50, 'Processing background...');
      const background = await videoService.processBackground(job.backgroundPath, {
        targetDuration: voiceOver.duration
      });

      // 4. Generate subtitles
      this.updateJobProgress(job, batch, 70, 'Generating subtitles...');
      const subtitles = await subtitleService.generateSubtitles(voiceOver.path, {
        language: job.language || 'en'
      });

      // 5. Composite final video
      this.updateJobProgress(job, batch, 90, 'Compositing video...');
      const finalVideo = await videoService.compositeVideo({
        background: background.path,
        audio: voiceOver.path,
        subtitles: subtitles.path,
        overlays: {
          progressBar: true,
          partNumber: job.partNumber
        }
      });

      // 6. Optimize for platform
      this.updateJobProgress(job, batch, 95, 'Optimizing...');
      const optimized = await performanceOptimizer.optimizeVideo(
        finalVideo.path,
        job.platform || 'tiktok'
      );

      // Success
      job.status = 'completed';
      job.progress = 100;
      job.outputPath = optimized;
      job.completedAt = new Date();

      this.emit('job:completed', { batchId: batch.id, job });
      logger.info(`Job ${job.id} completed successfully`);

    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.failedAt = new Date();

      this.emit('job:failed', { batchId: batch.id, job, error });
      logger.error(`Job ${job.id} failed:`, error);

    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  updateJobProgress(job, batch, progress, message) {
    job.progress = progress;
    job.statusMessage = message;
    this.emit('job:progress', { batchId: batch.id, job });
  }

  getBatchStatus(batchId) {
    return this.queue.find(b => b.id === batchId) || 
           this.activeJobs.get(batchId);
  }

  cancelBatch(batchId) {
    const batchIndex = this.queue.findIndex(b => b.id === batchId);
    
    if (batchIndex !== -1) {
      const batch = this.queue.splice(batchIndex, 1)[0];
      batch.status = 'cancelled';
      this.emit('batch:cancelled', batch);
      return batch;
    }

    return null;
  }
}
```

**Checklist**:
- [ ] Implement queue management
- [ ] Add parallel job processing (2 workers)
- [ ] Implement progress tracking
- [ ] Add batch cancellation
- [ ] Emit events pentru UI updates
- [ ] Add batch summary statistics
- [ ] Test cu 10+ jobs simultane

---

## 📋 FAZA 4: Polish & Optimization (3-4 zile)

**Obiectiv**: Production-ready quality și performance optimization

### Sprint 4.1: Performance Optimization (2 zile)

#### 4.1.1 Platform-Specific Export
```javascript
// apps/orchestrator/src/utils/performanceOptimizer.js

class PerformanceOptimizer {
  getExportPreset(platform) {
    const presets = {
      tiktok: {
        codec: 'libx264',
        preset: 'fast',
        crf: 23,
        maxBitrate: '8M',
        bufsize: '8M',
        audioBitrate: '192k',
        profile: 'high',
        level: '4.2',
        pixelFormat: 'yuv420p'
      },
      youtube: {
        codec: 'libx264',
        preset: 'slow',
        crf: 21,
        maxBitrate: '12M',
        bufsize: '12M',
        audioBitrate: '192k',
        profile: 'high',
        level: '4.2',
        pixelFormat: 'yuv420p'
      },
      instagram: {
        codec: 'libx264',
        preset: 'medium',
        crf: 23,
        maxBitrate: '8M',
        bufsize: '8M',
        audioBitrate: '192k',
        profile: 'main',
        level: '4.0',
        pixelFormat: 'yuv420p'
      }
    };

    return presets[platform] || presets.tiktok;
  }

  async optimizeVideo(inputPath, platform) {
    const preset = this.getExportPreset(platform);
    const outputPath = inputPath.replace('.mp4', `_${platform}.mp4`);

    const command = `"${process.env.FFMPEG_PATH}" -i "${inputPath}" \
      -c:v ${preset.codec} \
      -preset ${preset.preset} \
      -crf ${preset.crf} \
      -maxrate ${preset.maxBitrate} \
      -bufsize ${preset.bufsize} \
      -profile:v ${preset.profile} \
      -level:v ${preset.level} \
      -pix_fmt ${preset.pixelFormat} \
      -c:a aac -b:a ${preset.audioBitrate} \
      -movflags +faststart \
      -y "${outputPath}"`;

    await execAsync(command);

    // Validate output
    const validation = await this.validateOutput(outputPath);
    
    if (!validation.valid) {
      throw new Error(`Video validation failed: ${JSON.stringify(validation.checks)}`);
    }

    return outputPath;
  }

  async validateOutput(videoPath) {
    const probe = await this.probeVideo(videoPath);

    const checks = {
      exists: await fs.access(videoPath).then(() => true).catch(() => false),
      resolution: probe.width === 1080 && probe.height === 1920,
      aspectRatio: Math.abs(probe.height / probe.width - 16/9) < 0.01,
      fps: probe.fps >= 29 && probe.fps <= 31,
      duration: probe.duration > 0 && probe.duration <= 60,
      audioCodec: probe.audioCodec === 'aac',
      videoCodec: probe.videoCodec === 'h264',
      fileSize: probe.size > 100000 // > 100KB
    };

    return {
      valid: Object.values(checks).every(v => v === true),
      checks,
      metadata: probe
    };
  }

  async probeVideo(videoPath) {
    const command = `"${process.env.FFPROBE_PATH}" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -select_streams a:0 -show_entries stream=codec_name -show_entries format=duration,size -of json "${videoPath}"`;

    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);

    const videoStream = data.streams.find(s => s.codec_type === 'video');
    const audioStream = data.streams.find(s => s.codec_type === 'audio');

    return {
      width: parseInt(videoStream.width),
      height: parseInt(videoStream.height),
      fps: eval(videoStream.r_frame_rate), // e.g., "30/1"
      videoCodec: videoStream.codec_name,
      audioCodec: audioStream?.codec_name,
      duration: parseFloat(data.format.duration),
      size: parseInt(data.format.size)
    };
  }
}
```

**Checklist**:
- [ ] Implement platform-specific presets
- [ ] Add video validation
- [ ] Test encoding speed vs quality
- [ ] Optimize pentru fast start (streaming)
- [ ] Add bitrate ladder testing
- [ ] Document best practices

### Sprint 4.2: Error Recovery & Monitoring (1-2 zile)

#### 4.2.1 Retry Logic
```javascript
// apps/orchestrator/src/utils/errorRecovery.js

class ErrorRecovery {
  constructor() {
    this.retryLimits = {
      ai: 3,
      media: 2,
      network: 5
    };
    this.checkpoints = new Map();
  }

  async withRetry(operation, type = 'general', context = {}) {
    const limit = this.retryLimits[type] || 3;
    let lastError;

    for (let attempt = 1; attempt <= limit; attempt++) {
      try {
        logger.info(`Attempt ${attempt}/${limit} for ${type} operation`);
        return await operation();

      } catch (error) {
        lastError = error;
        logger.warn(`Attempt ${attempt}/${limit} failed:`, error.message);

        if (attempt < limit) {
          const delay = this.calculateBackoff(attempt);
          logger.info(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    logger.error(`Operation failed after ${limit} attempts:`, lastError);
    throw new Error(`${type} operation failed after ${limit} attempts: ${lastError.message}`);
  }

  calculateBackoff(attempt) {
    // Exponential backoff: 1s, 2s, 4s, 8s (max 10s)
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Checkpoint system pentru recovery
  async saveCheckpoint(jobId, stage, data) {
    this.checkpoints.set(`${jobId}:${stage}`, {
      jobId,
      stage,
      data,
      timestamp: new Date(),
      status: 'success'
    });

    logger.info(`Checkpoint saved: ${jobId} - ${stage}`);
  }

  async loadCheckpoints(jobId) {
    const checkpoints = [];
    
    for (const [key, value] of this.checkpoints) {
      if (key.startsWith(jobId)) {
        checkpoints.push(value);
      }
    }

    return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
  }

  async recoverPartialWork(jobId) {
    const checkpoints = await this.loadCheckpoints(jobId);

    if (checkpoints.length === 0) {
      return null;
    }

    const lastGood = checkpoints.find(cp => cp.status === 'success');

    if (lastGood) {
      logger.info(`Recovering job ${jobId} from checkpoint: ${lastGood.stage}`);
      return {
        resumeFrom: lastGood.stage,
        data: lastGood.data
      };
    }

    return null;
  }

  clearCheckpoints(jobId) {
    for (const key of this.checkpoints.keys()) {
      if (key.startsWith(jobId)) {
        this.checkpoints.delete(key);
      }
    }
  }
}
```

**Checklist**:
- [ ] Implement retry cu exponential backoff
- [ ] Add checkpoint system
- [ ] Implement recovery from checkpoints
- [ ] Test failure scenarios
- [ ] Add monitoring și alerting
- [ ] Document error handling

### Sprint 4.3: Testing & Documentation (1 zi)

#### 4.3.1 Integration Tests
```javascript
// tests/integration/pipeline.test.js

describe('End-to-End Pipeline', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestData();
  });

  it('should generate complete video from topic', async () => {
    const job = {
      topic: 'haunted house in the woods',
      genre: 'horror',
      voice: 'en_US',
      platform: 'tiktok',
      backgroundPath: './test/fixtures/background.mp4'
    };

    const result = await pipelineService.process(job);

    expect(result.status).toBe('completed');
    expect(result.outputPath).toBeTruthy();
    expect(fs.existsSync(result.outputPath)).toBe(true);

    // Validate output
    const validation = await performanceOptimizer.validateOutput(result.outputPath);
    
    expect(validation.valid).toBe(true);
    expect(validation.checks.resolution).toBe(true);
    expect(validation.checks.aspectRatio).toBe(true);
    expect(validation.checks.fps).toBe(true);
  });

  it('should handle batch processing', async () => {
    const jobs = Array(5).fill(null).map((_, i) => ({
      topic: `test topic ${i}`,
      genre: 'mystery',
      platform: 'youtube',
      backgroundPath: './test/fixtures/background.mp4'
    }));

    const batch = await batchService.addBatch(jobs);

    // Wait for completion
    await waitForBatchCompletion(batch.id, 300000); // 5 min timeout

    const status = batchService.getBatchStatus(batch.id);
    
    expect(status.status).toMatch(/completed|partial/);
    expect(status.summary.completed).toBeGreaterThan(0);
  });

  it('should recover from errors', async () => {
    // Simulate failure during processing
    const job = {
      topic: 'test recovery',
      genre: 'horror',
      // Missing backgroundPath to trigger error
    };

    await expect(pipelineService.process(job)).rejects.toThrow();

    // Check checkpoints were saved
    const checkpoints = await errorRecovery.loadCheckpoints(job.id);
    expect(checkpoints.length).toBeGreaterThan(0);
  });
});
```

**Checklist**:
- [ ] Write integration tests pentru full pipeline
- [ ] Test batch processing
- [ ] Test error recovery
- [ ] Add performance benchmarks
- [ ] Generate test coverage report
- [ ] Document API endpoints
- [ ] Create user guide

---

## 📊 Progress Tracking

### Metrici de Succes

#### Performance
- [ ] Video generation: < 30s pentru 60s content
- [ ] Batch processing: 2-3 videos în paralel
- [ ] Memory usage: < 2GB RAM
- [ ] CPU usage: < 80% average

#### Quality
- [ ] Video: 1080x1920 @30fps, H.264
- [ ] Audio: -16 LUFS normalized, AAC 192kbps
- [ ] Subtitles: 95%+ accuracy
- [ ] File size: < 50MB per minute

#### Reliability
- [ ] Success rate: > 95%
- [ ] Error recovery: Automatic retry
- [ ] Checkpoint system: Resume from failure
- [ ] Uptime: > 99% (backend)

### Weekly Goals

#### Week 1: Foundation
- [ ] Tool setup complete
- [ ] Environment configured
- [ ] Health checks working
- [ ] Basic tests passing

#### Week 2: Core Implementation
- [ ] AI script generation working
- [ ] TTS generation functional
- [ ] Video processing pipeline working
- [ ] Integration tests passing

#### Week 3: Advanced Features
- [ ] Batch processing working
- [ ] Subtitle generation functional
- [ ] Queue management stable
- [ ] Performance acceptable

#### Week 4: Polish & Release
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Production MSI ready

---

## 🚀 Quick Commands

```bash
# Development
pnpm dev                    # Both UI + backend
pnpm dev:backend           # Backend only
pnpm dev:ui                # UI only

# Testing
pnpm test:services         # Test individual services
pnpm test:integration      # Test service integration
pnpm test:pipeline         # Test full pipeline
pnpm test:all             # Complete test suite

# Build
pnpm build                # Build both apps
pnpm tauri build          # Create MSI

# Cleanup
pnpm clean:cache          # Clear processing cache
pnpm clean:all            # Clean all build artifacts
```

---

## 📝 Notes & Issues

### Known Issues
- [ ] Issue #1: Description
- [ ] Issue #2: Description

### Future Enhancements
- [ ] Support pentru multiple platforme simultane
- [ ] Advanced scheduling cu cron
- [ ] Cloud storage integration
- [ ] Analytics dashboard
- [ ] Mobile app pentru monitoring

### Dependencies to Update
- [ ] FFmpeg: Current version, check for updates
- [ ] Piper: Current version, check for updates
- [ ] Whisper: Current version, check for updates

---

## 📅 Change Log

### v1.0.0 (Current)
- ✅ Initial monorepo setup
- ✅ Backend API structure
- ✅ UI shell cu 9 tabs
- ✅ MSI build system
- 📋 Tool integration pending

### v0.9.0 (Previous)
- Infrastructure setup
- Basic routing
- Test framework

---

**Ultima actualizare**: 02 noiembrie 2025  
**Următoarea review**: După completarea Fazei 1  
**Responsabil**: Development Team
