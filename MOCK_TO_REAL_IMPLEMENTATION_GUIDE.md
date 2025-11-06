# Mock to Real Implementation Guide

**Generated**: November 4, 2025  
**Project**: Video Orchestrator  
**Purpose**: Comprehensive inventory of mock/placeholder implementations and concrete replacement strategies

---

## 📊 Summary

**Verification Status** (from PowerShell checks):
- ✅ All backend service files exist
- ✅ Tools folder: **1,428.78 MB** (FFmpeg, Piper, Whisper likely present)
- ✅ MSI package: **581.74 MB** (complete, not stub)
- ✅ Last build: November 3, 2025 at 19:29:31

**Mock Implementation Coverage**:
- 🔴 **AI & Analytics**: 3 services (aiService, contentAnalyzerService, trendMonitoringService)
- 🔴 **Video Rendering**: 3 services (videoService, godotService, performanceOptimizer)
- 🔴 **Audio/TTS/Subs**: 3 services (ttsService, subtitleService, subsService)
- 🔴 **Media & Data**: 2 services (stockMediaService, templateMarketplaceService)
- 🔴 **Automation**: 3 services (autoPilotService, batchService, schedulerService)
- 🔴 **Export**: 1 service (exportService)
- 🟡 **Frontend**: 2 components (TemplatesMarketplace.svelte, ExportTab.svelte)

---

## 🔴 BACKEND SERVICES - DETAILED INVENTORY

### 1. AI & Analytics Services

#### `apps/orchestrator/src/services/aiService.js`

**Current Mock Behavior**:
- **Lines 117-125**: `getMockResponse()` method returns hardcoded script, hooks, hashtags when no API keys configured
- **Line 236**: Legacy export uses mock cache service with `get: () => null`

**What Needs Replacement**:
```javascript
// MOCK (lines 202-221):
getMockResponse(topic, genre) {
  return {
    script: `This is a mock ${genre} script about ${topic}...`,
    hooks: [`You won't believe what happened with ${topic}...`, ...],
    hashtags: [`#${genre}`, `#${topic.replace(/\s+/g, '').toLowerCase()}`, ...],
    metadata: { ..., mock: true }
  };
}
```

**Concrete Implementation**:
1. ✅ **Already implemented**: OpenAI integration (lines 162-177) and Gemini integration (lines 179-198)
2. ⚠️ **Issue**: Falls back to mock when `process.env.OPENAI_API_KEY` and `process.env.GEMINI_API_KEY` are missing
3. **Action Required**:
   - Ensure `.env` file has valid API keys
   - Add startup validation: check API keys at service initialization
   - Log clear error messages instead of silently returning mock data
   - Add config validator:
     ```javascript
     validateAPIKeys() {
       if (!this.openaiClient && !this.geminiClient) {
         this.logger.error('No AI API keys configured. Set OPENAI_API_KEY or GEMINI_API_KEY in .env');
         throw new Error('AI service requires at least one API key (OpenAI or Gemini)');
       }
     }
     ```

**Testing**:
- Verify `process.env.OPENAI_API_KEY` is set and valid
- Test script generation with real API
- Ensure error handling when API rate limits hit

---

#### `apps/orchestrator/src/services/contentAnalyzerService.js`

**Current Mock Behavior**:
- **Lines 21-28**: Calls non-existent `this.aiService.generateCompletion()` method
- Falls back to default analysis values in `_parseAnalysisResponse()` (lines 158-170)

**What Needs Replacement**:
```javascript
// MOCK (lines 21-28):
const analysis = await this.aiService.generateCompletion({
  prompt: this._buildScriptAnalysisPrompt(scriptData),
  temperature: 0.3,
  maxTokens: 1000
});
```

**Concrete Implementation**:
1. **Create `generateCompletion()` method** in `AIService`:
   ```javascript
   // Add to aiService.js:
   async generateCompletion({ prompt, temperature = 0.7, maxTokens = 1000 }) {
     if (this.openaiClient) {
       const completion = await this.openaiClient.chat.completions.create({
         model: 'gpt-4o-mini',
         messages: [{ role: 'user', content: prompt }],
         temperature,
         max_tokens: maxTokens
       });
       return completion.choices[0].message.content;
     } else if (this.geminiClient) {
       const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
       const result = await model.generateContent([prompt]);
       return (await result.response).text();
     }
     throw new Error('No AI client available for completion');
   }
   ```

2. **Update ContentAnalyzerService**:
   - Import and inject real `AIService` instance
   - Replace `_parseAnalysisResponse()` fallback with proper error handling
   - Add validation for AI response format

**Testing**:
- Test script analysis with sample scripts
- Verify JSON parsing from AI responses
- Test fallback when AI service unavailable

---

#### `apps/orchestrator/src/services/trendMonitoringService.js`

**Current Mock Behavior**:
- **Lines 13-70**: `MOCK_TRENDS` constant provides all trend data
- **Lines 130-139**: `fetchMockTrends()` returns hardcoded trends
- **Lines 75**: Only `TREND_SOURCES.MOCK` is enabled

**What Needs Replacement**:
```javascript
// MOCK (lines 13-70):
const MOCK_TRENDS = {
  horror: [
    { id: 'mock-horror-1', keyword: 'haunted house stories', ... },
    { id: 'mock-horror-2', keyword: 'urban legends', ... }
  ],
  // ... other genres
};
```

**Concrete Implementation**:
1. **Integrate TikTok Creative Center API**:
   ```javascript
   async fetchTikTokTrends(genre, region) {
     const response = await axios.get('https://ads.tiktok.com/creative_radar_api/top_trends', {
       headers: { 'Access-Token': process.env.TIKTOK_API_TOKEN },
       params: { industry_id: this.mapGenreToIndustry(genre), region }
     });
     return this.parseTikTokResponse(response.data);
   }
   ```

2. **Integrate Google Trends API** (unofficial or Pytrends via Python subprocess):
   ```javascript
   async fetchGoogleTrends(genre, region) {
     const keywords = this.getGenreKeywords(genre);
     const response = await axios.get('https://trends.google.com/trends/api/explore', {
       params: { q: keywords.join(','), geo: region }
     });
     return this.parseGoogleTrendsResponse(response.data);
   }
   ```

3. **Fallback Strategy**:
   - Cache trends for 30 minutes (already implemented line 117)
   - Use mock data only when all APIs fail
   - Log API failures clearly

**Testing**:
- Test with TikTok API credentials
- Verify trend ranking and deduplication
- Test cache expiration

---

### 2. Video Rendering Services

#### `apps/orchestrator/src/services/videoService.js`

**Current Mock Behavior**:
- **Lines 138-147**: `runFFmpeg()` creates 1 KB placeholder file instead of actual video processing
- **Lines 149-157**: `runCompositeFFmpeg()` creates 2 KB placeholder file
- **Lines 170-177**: `getVideoInfo()` returns hardcoded dimensions (1080x1920) and duration (60s)

**What Needs Replacement**:
```javascript
// MOCK (lines 138-147):
async runFFmpeg(inputPath, outputPath, filters) {
  this.logger.debug('FFmpeg processing', { inputPath, outputPath, filters });
  await fs.writeFile(outputPath, Buffer.alloc(1024)); // ❌ Mock 1KB file
}
```

**Concrete Implementation**:
1. **Use fluent-ffmpeg or spawn FFmpeg binary**:
   ```javascript
   import ffmpeg from 'fluent-ffmpeg';
   
   async runFFmpeg(inputPath, outputPath, filters) {
     return new Promise((resolve, reject) => {
       let cmd = ffmpeg(inputPath);
       
       // Apply filters
       if (filters.length > 0) {
         cmd = cmd.videoFilters(filters);
       }
       
       cmd
         .output(outputPath)
         .on('end', resolve)
         .on('error', reject)
         .run();
     });
   }
   ```

2. **Implement real composite operation**:
   ```javascript
   async runCompositeFFmpeg(background, audio, outputPath, filters, platform) {
     const preset = this.getExportPreset(platform);
     
     return new Promise((resolve, reject) => {
       let cmd = ffmpeg()
         .input(background)
         .input(audio)
         .complexFilter([...filters, 'overlay=0:0'])
         .videoBitrate(preset.videoBitrate)
         .audioBitrate(preset.audioBitrate)
         .output(outputPath)
         .on('end', resolve)
         .on('error', reject)
         .run();
     });
   }
   ```

3. **Use ffprobe for real video info**:
   ```javascript
   async getVideoInfo(videoPath) {
     return new Promise((resolve, reject) => {
       ffmpeg.ffprobe(videoPath, (err, metadata) => {
         if (err) return reject(err);
         
         const videoStream = metadata.streams.find(s => s.codec_type === 'video');
         resolve({
           id: uuidv4(),
           path: videoPath,
           duration: metadata.format.duration,
           width: videoStream.width,
           height: videoStream.height,
           fps: eval(videoStream.r_frame_rate), // e.g., "30/1" -> 30
           size: metadata.format.size,
           format: metadata.format.format_name
         });
       });
     });
   }
   ```

**Prerequisites**:
- Verify `tools/ffmpeg/bin/ffmpeg.exe` exists and is executable
- Install `fluent-ffmpeg` package: `pnpm add fluent-ffmpeg`
- Set `FFMPEG_PATH` and `FFPROBE_PATH` in toolPaths.js

**Testing**:
- Test background processing with sample video
- Test composite with audio overlay
- Verify video info extraction accuracy

---

#### `apps/orchestrator/src/services/godotService.js`

**Current Mock Behavior**:
- **Lines 130-168**: `createMockBackground()` creates 1 MB placeholder file when Godot binary missing
- **Line 64**: Never actually spawns Godot process

**What Needs Replacement**:
```javascript
// MOCK (lines 130-168):
async createMockBackground(outputPath, style, colorScheme) {
  const mockVideoData = Buffer.alloc(1024 * 1024); // ❌ 1MB mock
  await fs.writeFile(outputPath, mockVideoData);
  return { ..., mock: true };
}
```

**Concrete Implementation**:
1. **Verify Godot availability** at service initialization:
   ```javascript
   async initialize() {
     const availability = await this.checkGodotAvailability();
     if (!availability.available) {
       this.logger.warn('Godot not available - voxel backgrounds disabled', availability);
       this.godotAvailable = false;
     } else {
       this.godotAvailable = true;
       this.logger.info('Godot engine initialized', { path: this.godotPath });
     }
   }
   ```

2. **Real Godot spawning** (already implemented lines 75-106):
   - Code exists but needs binary verification
   - Ensure `tools/godot/bin/godot.exe` present
   - Ensure `tools/godot/projects/voxel-generator` project exists

3. **Fallback to stock videos**:
   - If Godot unavailable, use `stockMediaService.searchVideos('voxel background')`
   - Or provide pre-rendered voxel backgrounds in `data/assets/backgrounds/`

**Prerequisites**:
- Download Godot 4.x headless build
- Create or import voxel-generator project
- Test video export capability with `--export-video` flag

**Testing**:
- Test Godot spawn with sample scene config
- Verify video export format (MP4, 9:16, 30fps)
- Measure generation time (target <60s for 60s video)

---

#### `apps/orchestrator/src/utils/performanceOptimizer.js`

**Current Mock Behavior**:
- **Lines 61-65**: `runFFmpegOptimization()` just copies file instead of optimizing
- **Lines 82-94**: `probeVideo()` returns hardcoded metadata

**What Needs Replacement**:
```javascript
// MOCK (lines 61-65):
async runFFmpegOptimization(inputPath, outputPath, settings) {
  this.logger.debug('FFmpeg optimization', { inputPath, outputPath, settings });
  const inputData = await fs.readFile(inputPath); // ❌ Just copy
  await fs.writeFile(outputPath, inputData);
}
```

**Concrete Implementation**:
1. **Real FFmpeg optimization**:
   ```javascript
   async runFFmpegOptimization(inputPath, outputPath, settings) {
     return new Promise((resolve, reject) => {
       ffmpeg(inputPath)
         .videoCodec(settings.codec === 'h264' ? 'libx264' : settings.codec)
         .outputOptions([
           `-preset ${settings.preset}`,
           `-crf ${settings.crf}`,
           `-maxrate ${settings.maxBitrate}`,
           `-bufsize ${settings.bufsize}`,
           `-profile:v ${settings.profile}`,
           `-level ${settings.level}`
         ])
         .output(outputPath)
         .on('end', resolve)
         .on('error', reject)
         .run();
     });
   }
   ```

2. **Use ffprobe for real metadata** (same as videoService.getVideoInfo())

**Testing**:
- Compare file sizes before/after optimization
- Verify video quality with different CRF values
- Test platform-specific presets (TikTok, YouTube, Instagram)

---

### 3. Audio/TTS/Subtitles Services

#### `apps/orchestrator/src/services/ttsService.js`

**Current Mock Behavior**:
- **Lines 102-109**: `createMockTTS()` creates placeholder WAV file
- **Line 49**: Falls back to mock when Piper binary missing

**What Needs Replacement**:
```javascript
// MOCK (lines 102-109):
async createMockTTS(text, voice, outputPath) {
  const duration = Math.max(text.length * 0.1, 2);
  await fs.writeFile(outputPath, Buffer.alloc(duration * 44100 * 2)); // ❌ Mock audio
  return { ..., mock: true };
}
```

**Concrete Implementation**:
1. **Verify Piper availability** at service initialization:
   ```javascript
   async initialize() {
     try {
       await fs.access(this.piperPath);
       const models = await fs.readdir(this.modelsDir);
       this.logger.info('Piper TTS initialized', { 
         models: models.filter(f => f.endsWith('.onnx')).length 
       });
     } catch (error) {
       this.logger.warn('Piper not available - TTS disabled', { error: error.message });
       this.piperAvailable = false;
     }
   }
   ```

2. **Real Piper spawning** (already implemented lines 55-88):
   - Code exists, needs binary verification
   - Ensure `tools/piper/piper.exe` present
   - Ensure models in `tools/piper/models/*.onnx`

3. **Real audio normalization** (lines 90-97 placeholder):
   ```javascript
   async normalizeAudio(audioPath) {
     const normalizedPath = audioPath.replace('.wav', '_normalized.wav');
     
     return new Promise((resolve, reject) => {
       ffmpeg(audioPath)
         .audioFilters([
           'loudnorm=I=-16:TP=-1.5:LRA=11',
           'highpass=f=80',
           'lowpass=f=15000'
         ])
         .output(normalizedPath)
         .on('end', () => {
           fs.rename(normalizedPath, audioPath).then(resolve).catch(reject);
         })
         .on('error', reject)
         .run();
     });
   }
   ```

4. **Real duration calculation** (lines 99-103 placeholder):
   ```javascript
   async getAudioDuration(audioPath) {
     return new Promise((resolve, reject) => {
       ffmpeg.ffprobe(audioPath, (err, metadata) => {
         if (err) return reject(err);
         resolve(metadata.format.duration);
       });
     });
   }
   ```

**Prerequisites**:
- Verify `tools/piper/piper.exe` exists
- Download Piper voice models (en_US-amy-medium.onnx, etc.)
- Test Piper with sample text

**Testing**:
- Generate TTS for short text (10s)
- Generate TTS for long text (60s)
- Test voice quality and pronunciation
- Verify audio normalization works

---

#### `apps/orchestrator/src/services/subtitleService.js` & `subsService.js`

**Current Mock Behavior**:
- **subtitleService.js lines 63-70**: `createMockTranscription()` returns hardcoded segments
- **subsService.js lines 34-214**: Similar mock transcription when Whisper missing

**What Needs Replacement**:
```javascript
// MOCK (subtitleService.js lines 63-70):
createMockTranscription(audioPath) {
  return {
    segments: [
      { start: 0, end: 3, text: 'This is a mock subtitle generated' },
      { start: 3, end: 6, text: `for audio file ${path.basename(audioPath)}` },
      // ... more mock segments
    ],
    duration: 30
  };
}
```

**Concrete Implementation**:
1. **Verify Whisper.cpp availability**:
   ```javascript
   async initialize() {
     try {
       await fs.access(this.whisperPath);
       await fs.access(path.join(this.modelsDir, 'ggml-base.en.bin'));
       this.logger.info('Whisper initialized');
     } catch (error) {
       this.logger.warn('Whisper not available - subtitle generation disabled');
       this.whisperAvailable = false;
     }
   }
   ```

2. **Real Whisper spawning** (already implemented in both files):
   - Code exists (subtitleService.js lines 39-61)
   - Needs binary and model verification
   - Ensure `tools/whisper/main.exe` and `tools/whisper/models/ggml-base.en.bin` present

3. **Unified service** (currently two similar services):
   - Merge `subtitleService.js` and `subsService.js` to avoid duplication
   - Use `subtitleService.js` as canonical implementation

**Prerequisites**:
- Verify `tools/whisper/main.exe` exists
- Download Whisper model: `ggml-base.en.bin` (~140 MB)
- Test Whisper with sample audio

**Testing**:
- Transcribe short audio (10s)
- Transcribe long audio (60s)
- Verify SRT timing accuracy
- Test with different languages (if supported)

---

### 4. Media & Data Services

#### `apps/orchestrator/src/services/stockMediaService.js`

**Current Mock Behavior**:
- **Lines 104-107**: Returns mock results when no API keys configured
- **Lines 583-608**: `getMockResults()` returns placeholder.com thumbnails

**What Needs Replacement**:
```javascript
// MOCK (lines 104-107):
if (!this.pexelsApiKey && !this.pixabayApiKey) {
  this.logger.warn('No stock media API keys configured, using mock results');
  return this.getMockResults(query, perPage);
}
```

**Concrete Implementation**:
1. **Already implemented** - Real API integration exists (lines 128-254)
2. **Action Required**:
   - Add `PEXELS_API_KEY` and `PIXABAY_API_KEY` to `.env`
   - Test API integration with sample queries
   - Ensure error handling for rate limits

3. **API Key Validation** at startup:
   ```javascript
   constructor({ logger, config, aiService }) {
     // ...existing code...
     
     if (!this.pexelsApiKey && !this.pixabayApiKey) {
       this.logger.warn('No stock media API keys configured. Video search will use mock data.');
     } else {
       this.logger.info('Stock media service initialized', {
         pexels: !!this.pexelsApiKey,
         pixabay: !!this.pixabayApiKey
       });
     }
   }
   ```

**Prerequisites**:
- Get free Pexels API key: https://www.pexels.com/api/
- Get free Pixabay API key: https://pixabay.com/api/docs/
- Add to `.env`:
  ```
  PEXELS_API_KEY=your_key_here
  PIXABAY_API_KEY=your_key_here
  ```

**Testing**:
- Search for "dark forest" video
- Verify download functionality
- Test AI-powered suggestions

---

#### `apps/orchestrator/src/services/templateMarketplaceService.js`

**Current Mock Behavior**:
- **Lines 24-70**: `initializeSeedTemplates()` populates marketplace with hardcoded templates
- **Lines 180-189**: Purchases not persisted to database

**What Needs Replacement**:
```javascript
// MOCK (lines 24-70):
initializeSeedTemplates() {
  this.templates = [
    { id: 'horror-suspense-01', name: 'Horror Suspense Pro', ... },
    { id: 'mystery-noir-02', name: 'Mystery Noir Classic', ... },
    // ... hardcoded templates
  ];
}
```

**Concrete Implementation**:
1. **Database integration** (PostgreSQL or MongoDB):
   ```javascript
   async initializeFromDatabase() {
     const templates = await this.db.query('SELECT * FROM templates WHERE active = true');
     this.templates = templates.rows.map(row => ({
       id: row.id,
       name: row.name,
       description: row.description,
       category: row.category,
       price: row.price,
       rating: row.rating,
       downloads: row.downloads,
       // ...
     }));
     this.logger.info('Marketplace loaded from database', { count: this.templates.length });
   }
   ```

2. **Persist purchases**:
   ```javascript
   async purchaseTemplate(templateId, userId) {
     // ... existing validation ...
     
     const purchase = await this.db.query(
       'INSERT INTO purchases (user_id, template_id, price, purchased_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
       [userId, templateId, template.price]
     );
     
     await this.db.query('UPDATE templates SET downloads = downloads + 1 WHERE id = $1', [templateId]);
     
     return purchase.rows[0];
   }
   ```

3. **File storage** for template downloads:
   - Store template JSON in `data/templates/{templateId}/template.json`
   - Generate signed download URLs with expiration

**Prerequisites**:
- Set up database (Prisma, TypeORM, or raw SQL)
- Create schema: `templates`, `purchases`, `reviews` tables
- Seed initial template data

**Testing**:
- Browse templates
- Purchase free and paid templates
- Download template files
- Submit reviews

---

### 5. Automation Services

#### `apps/orchestrator/src/services/autoPilotService.js`

**Current Mock Behavior**:
- **Lines 288-325**: All `_*WithFallback()` methods use template scripts, default assets, and mock dependencies

**What Needs Replacement**:
```javascript
// MOCK (lines 308-325):
_getTemplateScript(options) {
  return {
    script: `This is a ${genre} story about ${topic}...`, // ❌ Hardcoded
    hooks: [...], // ❌ Generic
    hashtags: [...], // ❌ Generic
    metadata: { ..., source: 'template' }
  };
}
```

**Concrete Implementation**:
1. **Real dependency injection**:
   - Already structured correctly (constructor lines 7-13)
   - Needs real service instances instead of mocks

2. **Remove fallback templates**:
   - Replace `_getTemplateScript()` with proper error when AI fails
   - Replace `_getDefaultBackground()` with real background selection
   - Replace `_getDefaultMusic()` with audio library lookup

3. **Real pipeline integration**:
   ```javascript
   async _exportVideoWithFallback(data) {
     // Remove try-catch fallback - let errors propagate
     const pipelineData = {
       script: data.script,
       background: data.assets.background,
       voiceOver: data.voiceOver,
       audio: data.audio,
       subtitles: data.subtitles,
       settings: { platform: data.options.platform || 'tiktok', ... }
     };
     
     const result = await this.pipelineService.process(pipelineData);
     
     if (!result || !result.path) {
       throw new Error('Pipeline failed to produce video');
     }
     
     return result;
   }
   ```

**Prerequisites**:
- All dependent services must be implemented (AI, TTS, Video, Subtitles)
- Pipeline service must be functional

**Testing**:
- Create video from topic end-to-end
- Test with different genres and platforms
- Verify progress reporting
- Test error handling at each step

---

#### `apps/orchestrator/src/services/batchService.js`

**Current Mock Behavior**:
- **Lines 251-259**: Uses mock service implementations in legacy export

**What Needs Replacement**:
```javascript
// MOCK (lines 251-259):
export const batchService = {
  createBatchJob: async (params) => {
    const service = new BatchService({ 
      logger: console,
      aiService: { generateScript: () => ({ script: 'mock' }) }, // ❌ Mock
      ttsService: { generateVoiceOver: () => ({ path: 'mock.wav' }) }, // ❌ Mock
      // ... all mock services
    });
    return service.addBatch(params.videos || []);
  }
};
```

**Concrete Implementation**:
1. **Real service injection**:
   - Main `BatchService` class already correct (lines 7-13)
   - Remove legacy export or wire to real service factory

2. **Proper DI pattern**:
   ```javascript
   // Remove legacy export, use factory:
   export const createBatchService = ({ logger, aiService, ttsService, videoService, subtitleService }) => {
     return new BatchService({ logger, aiService, ttsService, videoService, subtitleService });
   };
   ```

3. **Job queue improvements**:
   - Add job prioritization
   - Add job cancellation support
   - Persist queue state to disk/database

**Prerequisites**:
- All dependent services implemented
- Consider using bull/bee-queue for production queue

**Testing**:
- Add batch of 3 videos
- Monitor parallel processing
- Test cancellation mid-batch
- Verify resource cleanup

---

#### `apps/orchestrator/src/services/schedulerService.js`

**Current Mock Behavior**:
- **Lines 157-172**: `postToPlatform()` just logs "[MOCK] Posting to ${platform}" and returns fake URL

**What Needs Replacement**:
```javascript
// MOCK (lines 157-172):
async postToPlatform(platform, post) {
  logger.info(`[MOCK] Posting to ${platform}`, { postId: post.id, videoPath: post.videoPath });
  await new Promise(resolve => setTimeout(resolve, 1000)); // ❌ Fake delay
  return {
    postUrl: `https://${platform}.com/post/${post.id}`, // ❌ Fake URL
    platformPostId: `${platform}_${Date.now()}`
  };
}
```

**Concrete Implementation**:
1. **TikTok API integration**:
   ```javascript
   async postToTikTok(post) {
     const formData = new FormData();
     formData.append('video', fs.createReadStream(post.videoPath));
     formData.append('caption', `${post.caption}\n\n${post.hashtags.join(' ')}`);
     
     const response = await axios.post('https://open-api.tiktok.com/share/video/upload/', formData, {
       headers: {
         'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
         'Content-Type': 'multipart/form-data'
       }
     });
     
     return {
       postUrl: response.data.share_url,
       platformPostId: response.data.share_id
     };
   }
   ```

2. **YouTube API integration**:
   ```javascript
   async postToYouTube(post) {
     const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
     
     const response = await youtube.videos.insert({
       part: 'snippet,status',
       requestBody: {
         snippet: {
           title: post.caption.substring(0, 100),
           description: `${post.caption}\n\n${post.hashtags.join(' ')}`,
           tags: post.hashtags.map(h => h.replace('#', ''))
         },
         status: { privacyStatus: 'public', selfDeclaredMadeForKids: false }
       },
       media: { body: fs.createReadStream(post.videoPath) }
     });
     
     return {
       postUrl: `https://www.youtube.com/shorts/${response.data.id}`,
       platformPostId: response.data.id
     };
   }
   ```

3. **Instagram API integration**:
   ```javascript
   async postToInstagram(post) {
     // Instagram Graph API for Reels
     const response = await axios.post(
       `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_USER_ID}/media`,
       {
         video_url: post.videoPath, // Must be publicly accessible URL
         caption: `${post.caption}\n\n${post.hashtags.join(' ')}`,
         media_type: 'REELS'
       },
       { params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN } }
     );
     
     const publishResponse = await axios.post(
       `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_USER_ID}/media_publish`,
       { creation_id: response.data.id },
       { params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN } }
     );
     
     return {
       postUrl: `https://www.instagram.com/reel/${publishResponse.data.id}`,
       platformPostId: publishResponse.data.id
     };
   }
   ```

4. **Platform router**:
   ```javascript
   async postToPlatform(platform, post) {
     switch (platform.toLowerCase()) {
       case 'tiktok':
         return await this.postToTikTok(post);
       case 'youtube':
         return await this.postToYouTube(post);
       case 'instagram':
         return await this.postToInstagram(post);
       default:
         throw new Error(`Unsupported platform: ${platform}`);
     }
   }
   ```

**Prerequisites**:
- TikTok Developer Account: https://developers.tiktok.com/
- YouTube API credentials: https://console.cloud.google.com/
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api/
- OAuth2 authentication flow for user consent
- Add tokens to `.env`:
  ```
  TIKTOK_ACCESS_TOKEN=your_token
  YOUTUBE_CLIENT_ID=your_id
  YOUTUBE_CLIENT_SECRET=your_secret
  INSTAGRAM_ACCESS_TOKEN=your_token
  INSTAGRAM_USER_ID=your_user_id
  ```

**Testing**:
- Schedule post for 1 minute in future
- Verify cron job triggers
- Test actual post to sandbox/test accounts
- Verify error handling for API failures

---

### 6. Export Service

#### `apps/orchestrator/src/services/exportService.js`

**Current Mock Behavior**:
- **Lines 154-165**: `applyEffects()` just copies file with placeholder note

**What Needs Replacement**:
```javascript
// MOCK (lines 154-165):
async applyEffects(videoPath, effects) {
  const outputPath = path.join(CACHE_DIR, `temp_effects_${Date.now()}.mp4`);
  await fs.copyFile(videoPath, outputPath); // ❌ Just copy
  
  this.logger.info('Effects applied (placeholder)', { 
    effects, 
    note: 'Effect application not fully implemented yet' 
  });
  
  return outputPath;
}
```

**Concrete Implementation**:
1. **Progress bar overlay**:
   ```javascript
   async applyProgressBar(videoPath, outputPath, duration) {
     return new Promise((resolve, reject) => {
       ffmpeg(videoPath)
         .videoFilters([
           `drawbox=x=0:y=ih-10:w=iw*t/${duration}:h=10:color=white@0.8:t=fill`
         ])
         .output(outputPath)
         .on('end', resolve)
         .on('error', reject)
         .run();
     });
   }
   ```

2. **Part badge overlay**:
   ```javascript
   async applyPartBadge(videoPath, outputPath, partNumber) {
     return new Promise((resolve, reject) => {
       ffmpeg(videoPath)
         .videoFilters([
           `drawtext=text='Part ${partNumber}':x=w-tw-20:y=20:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5`
         ])
         .output(outputPath)
         .on('end', resolve)
         .on('error', reject)
         .run();
     });
   }
   ```

3. **Watermark overlay**:
   ```javascript
   async applyWatermark(videoPath, outputPath, watermarkPath) {
     return new Promise((resolve, reject) => {
       ffmpeg(videoPath)
         .input(watermarkPath)
         .complexFilter([
           '[0:v][1:v]overlay=W-w-10:H-h-10' // Bottom-right corner
         ])
         .output(outputPath)
         .on('end', resolve)
         .on('error', reject)
         .run();
     });
   }
   ```

4. **Composite all effects**:
   ```javascript
   async applyEffects(videoPath, effects) {
     let currentPath = videoPath;
     const tempFiles = [];
     
     if (effects.progressBar) {
       const outputPath = path.join(CACHE_DIR, `temp_progress_${Date.now()}.mp4`);
       await this.applyProgressBar(currentPath, outputPath, effects.duration || 60);
       tempFiles.push(currentPath);
       currentPath = outputPath;
     }
     
     if (effects.partBadge) {
       const outputPath = path.join(CACHE_DIR, `temp_part_${Date.now()}.mp4`);
       await this.applyPartBadge(currentPath, outputPath, effects.partNumber || 1);
       tempFiles.push(currentPath);
       currentPath = outputPath;
     }
     
     if (effects.watermark) {
       const outputPath = path.join(CACHE_DIR, `temp_watermark_${Date.now()}.mp4`);
       await this.applyWatermark(currentPath, outputPath, effects.watermarkPath);
       tempFiles.push(currentPath);
       currentPath = outputPath;
     }
     
     // Cleanup intermediate files
     for (const file of tempFiles) {
       if (file !== videoPath) {
         await fs.unlink(file).catch(() => {});
       }
     }
     
     return currentPath;
   }
   ```

**Prerequisites**:
- FFmpeg with drawtext filter enabled
- Font files available for text overlays
- Sample watermark image

**Testing**:
- Apply progress bar only
- Apply part badge only
- Apply all effects together
- Verify no quality loss

---

## 🟡 FRONTEND COMPONENTS - DETAILED INVENTORY

### `apps/ui/src/components/TemplatesMarketplace.svelte`

**Current Mock Behavior**:
- **Line 20**: Hardcoded `userId = 'user-demo-001'`
- **Line 22**: `API_BASE = 'http://127.0.0.1:4545'` hardcoded

**What Needs Replacement**:
```javascript
// MOCK (lines 20-22):
const userId = 'user-demo-001'; // ❌ Hardcoded demo user
```

**Concrete Implementation**:
1. **User authentication**:
   ```javascript
   import { authStore } from '../../stores/authStore.js';
   
   let userId = '';
   
   authStore.subscribe(auth => {
     userId = auth.user?.id || '';
   });
   ```

2. **Environment-based API URL**:
   ```javascript
   const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4545';
   ```

3. **Add authentication state**:
   - Show login prompt if not authenticated
   - Disable purchase buttons for guests
   - Persist auth token in localStorage

**Prerequisites**:
- Implement authentication system (JWT, OAuth, or Tauri auth)
- Create `authStore.js` with login/logout methods

**Testing**:
- Browse templates as guest
- Login and purchase template
- Logout and verify restricted access

---

### `apps/ui/src/components/tabs/ExportTab.svelte`

**Current Mock Behavior**:
- **Lines 123-146**: `startExport()` simulates progress with `setInterval` instead of real backend streaming
- **Line 216**: `shareVideo()` shows toast "Sharing options coming soon"

**What Needs Replacement**:
```javascript
// MOCK (lines 123-146):
const progressInterval = setInterval(() => {
  if (exportProgress < 90) {
    exportProgress += 5; // ❌ Fake progress
  }
}, 500);
```

**Concrete Implementation**:
1. **Real-time export progress** via WebSocket or Server-Sent Events:
   ```javascript
   async function startExport() {
     // ... validation ...
     
     const ws = new WebSocket('ws://127.0.0.1:4545/export/stream');
     
     ws.onmessage = (event) => {
       const data = JSON.parse(event.data);
       exportProgress = data.progress;
       
       if (data.status === 'completed') {
         exportedVideo = data.result;
         exportStatus = 'completed';
         ws.close();
       } else if (data.status === 'error') {
         exportError = data.error;
         exportStatus = 'error';
         ws.close();
       }
     };
     
     ws.onerror = () => {
       exportStatus = 'error';
       exportError = 'Connection lost';
     };
     
     // Send export request
     ws.send(JSON.stringify({ action: 'export', data: exportData }));
   }
   ```

2. **Real sharing functionality**:
   ```javascript
   async function shareVideo() {
     if (!exportedVideo?.path) return;
     
     // Use Web Share API if available
     if (navigator.share) {
       try {
         await navigator.share({
           title: exportSettings.outputName,
           text: 'Check out my video!',
           url: exportedVideo.path
         });
         addNotification('Shared successfully!', 'success');
       } catch (err) {
         addNotification('Share cancelled', 'info');
       }
     } else {
       // Fallback: show share dialog
       showShareDialog(exportedVideo);
     }
   }
   ```

3. **Desktop file operations** via Tauri:
   ```javascript
   import { open } from '@tauri-apps/api/shell';
   import { dirname } from '@tauri-apps/api/path';
   
   async function openVideoLocation() {
     if (!exportedVideo?.path) return;
     
     const dir = await dirname(exportedVideo.path);
     await open(dir);
   }
   ```

**Prerequisites**:
- Backend WebSocket endpoint for export streaming
- Tauri shell API for file operations
- Share dialog component

**Testing**:
- Export video and monitor real progress
- Test share on mobile (Web Share API)
- Test "Open Location" on desktop

---

## 🎯 IMPLEMENTATION PRIORITY MATRIX

### Phase 1: Critical Path (Week 1)
**Goal**: Make core video pipeline functional

1. ✅ **videoService.js** - Real FFmpeg integration
2. ✅ **ttsService.js** - Real Piper TTS
3. ✅ **subtitleService.js** - Real Whisper transcription
4. ✅ **exportService.js** - Real effects overlay

**Acceptance Criteria**:
- Generate script with real AI
- Convert script to audio with Piper
- Create subtitles with Whisper
- Export final video with all layers
- File sizes > 1MB (not mock stubs)

---

### Phase 2: AI & Content (Week 2)
**Goal**: Remove AI fallbacks and mocks

1. ✅ **aiService.js** - Validate API keys, remove getMockResponse()
2. ✅ **contentAnalyzerService.js** - Implement generateCompletion() in AIService
3. ✅ **stockMediaService.js** - Add API keys, remove getMockResults()

**Acceptance Criteria**:
- Script generation uses real OpenAI/Gemini
- Content analysis returns real scores
- Stock video search returns real results
- No mock flags in responses

---

### Phase 3: Advanced Features (Week 3)
**Goal**: Trends, batch processing, scheduling

1. ✅ **trendMonitoringService.js** - Integrate TikTok/Google Trends APIs
2. ✅ **batchService.js** - Wire real service dependencies
3. ✅ **schedulerService.js** - Implement platform posting APIs
4. ✅ **godotService.js** - Verify Godot binary or add fallback

**Acceptance Criteria**:
- Trend data refreshes from real APIs
- Batch jobs process videos in parallel
- Scheduled posts go live on platforms
- Voxel backgrounds generate or fallback to stock

---

### Phase 4: Polish & Persistence (Week 4)
**Goal**: Database, auth, marketplace

1. ✅ **templateMarketplaceService.js** - Database integration
2. ✅ **autoPilotService.js** - Remove template fallbacks
3. ✅ **Frontend auth** - User authentication
4. ✅ **Export progress** - Real-time WebSocket streaming

**Acceptance Criteria**:
- Templates persist in database
- Purchases recorded and retrievable
- Users can login/logout
- Export progress updates in real-time

---

## 🛠️ QUICK START - Fix ONE Service (Example)

Let's fix **ttsService.js** as a concrete example you can follow for others.

### Step 1: Verify Binary
```powershell
Test-Path "d:\playground\Aplicatia\tools\piper\piper.exe"
# Expected: True

Get-ChildItem "d:\playground\Aplicatia\tools\piper\models" -Filter "*.onnx"
# Expected: List of .onnx files (voice models)
```

### Step 2: Update Service
Edit `apps/orchestrator/src/services/ttsService.js`:

```javascript
// ADD at top:
import { logger } from '../utils/logger.js';

// MODIFY constructor:
constructor({ logger: log }) {
  this.logger = log || logger;
  // ... existing code ...
  
  // ADD initialization check:
  this.initialize();
}

// ADD method:
async initialize() {
  try {
    await fs.access(this.piperPath);
    const models = await fs.readdir(this.modelsDir);
    const onnxModels = models.filter(f => f.endsWith('.onnx'));
    
    if (onnxModels.length === 0) {
      throw new Error('No voice models found');
    }
    
    this.piperAvailable = true;
    this.logger.info('Piper TTS initialized', { models: onnxModels.length });
  } catch (error) {
    this.piperAvailable = false;
    this.logger.error('Piper initialization failed', { error: error.message });
    throw new Error('Piper TTS not available. Download piper.exe and voice models.');
  }
}

// MODIFY generateVoiceOver:
async generateVoiceOver(text, options = {}) {
  // ... existing code ...
  
  try {
    // REMOVE this check:
    // await fs.access(this.piperPath);
    
    // REPLACE with:
    if (!this.piperAvailable) {
      throw new Error('Piper TTS not initialized');
    }
    
    await this.runPiper(text, voice, outputPath, speed);
    await this.normalizeAudio(outputPath);
  } catch (error) {
    this.logger.error('TTS generation failed', { error: error.message });
    // REMOVE: return this.createMockTTS(text, voice, outputPath);
    throw error; // Let caller handle error
  }
  
  // ... rest of method ...
}

// REMOVE createMockTTS() method entirely (lines 102-109)
```

### Step 3: Update Tests
Create or update `tests/unit/ttsService.spec.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { TTSService } from '../../apps/orchestrator/src/services/ttsService.js';

describe('TTSService', () => {
  let ttsService;
  
  beforeEach(() => {
    ttsService = new TTSService({ logger: console });
  });
  
  it('should initialize with Piper binary', async () => {
    expect(ttsService.piperAvailable).toBe(true);
  });
  
  it('should generate voice-over for short text', async () => {
    const result = await ttsService.generateVoiceOver('Hello world', {
      voice: 'en_US-amy-medium'
    });
    
    expect(result).toBeDefined();
    expect(result.path).toContain('.wav');
    expect(result.duration).toBeGreaterThan(0);
    expect(result.mock).toBeUndefined();
  });
  
  it('should throw error when Piper unavailable', async () => {
    ttsService.piperAvailable = false;
    
    await expect(
      ttsService.generateVoiceOver('Test', {})
    ).rejects.toThrow('Piper TTS not initialized');
  });
});
```

### Step 4: Run Tests
```powershell
Set-Location "d:\playground\Aplicatia"
pnpm test tests/unit/ttsService.spec.js
```

### Step 5: Integration Test
```powershell
# Test via API:
$body = @{
  text = "This is a test of the TTS system."
  voice = "en_US-amy-medium"
  speed = 1.0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:4545/tts/generate" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Expected response:
# {
#   "success": true,
#   "audio": {
#     "id": "uuid",
#     "path": "d:/playground/Aplicatia/data/tts/tts_xxxxx.wav",
#     "duration": 3.2,
#     "voice": "en_US-amy-medium",
#     "mock": undefined  # ← IMPORTANT: No mock flag!
#   }
# }

# Verify file exists and has real size:
Get-Item "d:\playground\Aplicatia\data\tts\*.wav" | Select Length
# Expected: > 50 KB (not 2 KB stub)
```

---

## 📦 DELIVERABLES CHECKLIST

### Before Claiming "Mock-Free"

For **each service**, verify:

- [ ] Binary/tool exists and is executable
- [ ] API keys (if needed) are in `.env` and valid
- [ ] Service initialization logs success (not warning)
- [ ] Unit tests pass without mocking
- [ ] Integration test produces real output files
- [ ] Output file sizes are realistic (> 50KB for audio, > 1MB for video)
- [ ] Response objects have no `mock: true` flags
- [ ] Error messages are informative (not generic "Mock data used")

### Documentation Updates

- [ ] Update `README.md` with real setup instructions
- [ ] Document required API keys and where to get them
- [ ] Add troubleshooting section for common errors
- [ ] Update architecture diagram to show real integrations
- [ ] Create `.env.example` with all required variables

### Testing Strategy

- [ ] Unit tests for each service (mocking external APIs only)
- [ ] Integration tests with real tools (FFmpeg, Piper, Whisper)
- [ ] End-to-end test: topic → script → audio → video → export
- [ ] Performance benchmarks: time to generate 60s video
- [ ] Load test: batch of 10 videos

---

## 🚀 NEXT STEPS

**Immediate Actions**:

1. **Run diagnostics**:
   ```powershell
   powershell -File scripts\diagnose-build.ps1
   ```

2. **Check tool availability**:
   ```powershell
   Get-ChildItem "d:\playground\Aplicatia\tools" -Recurse -Filter "*.exe" | Select Name, @{N="MB";E={[math]::Round($_.Length/1MB,2)}}, FullName
   ```

3. **Verify API keys**:
   ```powershell
   Get-Content "d:\playground\Aplicatia\.env" | Select-String "API_KEY"
   ```

4. **Start with Phase 1** (Critical Path):
   - Pick one service (recommend: `ttsService.js`)
   - Follow "Quick Start" example above
   - Verify with integration test
   - Move to next service

5. **Track progress**:
   - Create GitHub issues for each service
   - Link to this document for implementation guide
   - Mark issues as closed when tests pass

---

## 📞 SUPPORT & RESOURCES

**Tool Downloads**:
- FFmpeg: https://www.gyan.dev/ffmpeg/builds/
- Piper TTS: https://github.com/rhasspy/piper/releases
- Whisper.cpp: https://github.com/ggerganov/whisper.cpp/releases
- Godot Engine: https://godotengine.org/download

**API Documentation**:
- OpenAI: https://platform.openai.com/docs/api-reference
- Gemini: https://ai.google.dev/docs
- Pexels: https://www.pexels.com/api/documentation/
- Pixabay: https://pixabay.com/api/docs/
- TikTok: https://developers.tiktok.com/doc/content-posting-api-get-started

**Community**:
- FFmpeg filters: https://ffmpeg.org/ffmpeg-filters.html
- Piper voices: https://rhasspy.github.io/piper-samples/
- Whisper models: https://huggingface.co/ggerganov/whisper.cpp

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: ✅ Complete inventory, ready for implementation

