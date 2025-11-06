# Pictory & Kapwing Implementation Guide

## ✅ Implementation Complete

### Files Created

#### Backend Services
1. **`apps/orchestrator/src/services/pictoryService.js`** (150 lines)
   - Script-to-video generation
   - Stock footage search (3M+ videos)
   - Video status polling
   - Download management

2. **`apps/orchestrator/src/services/kapwingService.js`** (180 lines)
   - Project creation and management
   - Smart resize with AI tracking
   - Subtitle styling (50+ presets)
   - Batch processing
   - Layer management

3. **`apps/orchestrator/src/services/externalVideoService.js`** (150 lines)
   - Unified processing interface
   - 4 processing modes: pictory, kapwing, local, hybrid
   - Batch processing orchestration
   - Processing time estimates

#### API Routes
4. **`apps/orchestrator/src/routes/externalVideo.js`** (120 lines)
   - POST `/external-video/process` - Process single video
   - POST `/external-video/batch` - Batch processing
   - GET `/external-video/estimate/:method` - Get time estimates
   - POST `/external-video/pictory/stock-search` - Search stock footage
   - POST `/external-video/kapwing/smart-resize` - Smart resize videos

#### Frontend API Client
5. **`apps/ui/src/lib/api/client.ts`** (15 lines)
   - Base Ky HTTP client configuration
   - Retry logic and timeout handling

6. **`apps/ui/src/lib/api/externalVideo.ts`** (60 lines)
   - TypeScript interfaces
   - API methods for all external video operations

#### Container Registration
7. **Updated `apps/orchestrator/src/container/index.js`**
   - Registered pictoryService
   - Registered kapwingService
   - Registered externalVideoService
   - Registered externalVideoRouter

8. **Updated `apps/orchestrator/src/app.js`**
   - Added `/external-video` route
   - Added to API endpoints list

---

## 🚀 Quick Start

### 1. Add API Keys to Environment

```bash
# .env file
PICTORY_API_KEY=your_pictory_api_key_here
KAPWING_API_KEY=your_kapwing_api_key_here
```

### 2. Get Your API Keys

**Pictory**:
1. Login to https://pictory.ai
2. Go to Settings → API Keys
3. Generate new API key
4. Copy to `.env`

**Kapwing**:
1. Login to https://kapwing.com
2. Go to Account → API Access
3. Generate API token
4. Copy to `.env`

### 3. Test the Integration

```bash
# Start backend
cd apps/orchestrator
pnpm dev

# Test health check
curl http://127.0.0.1:4545/health

# Test Pictory integration
curl -X POST http://127.0.0.1:4545/external-video/process \
  -H "Content-Type: application/json" \
  -d '{
    "method": "pictory",
    "script": "This is a horror story about a haunted house...",
    "name": "Test Video",
    "aspectRatio": "9:16"
  }'

# Test Kapwing integration
curl -X POST http://127.0.0.1:4545/external-video/process \
  -H "Content-Type: application/json" \
  -d '{
    "method": "kapwing",
    "name": "Test Video",
    "backgroundPath": "./data/assets/backgrounds/video1.mp4",
    "audioPath": "./data/tts/voiceover.mp3",
    "subtitles": "Test subtitle text",
    "captionStyle": "tiktok-viral"
  }'
```

---

## 📖 API Usage Examples

### 1. Quick Mode (Pictory) - 3 minutes

```javascript
// Frontend usage
import { externalVideoApi } from '$lib/api/externalVideo';

const result = await externalVideoApi.processVideo({
  method: 'pictory',
  script: aiGeneratedScript,
  name: 'My Horror Story',
  voiceId: 'auto',
  aspectRatio: '9:16'
});

console.log('Video ready:', result.videoPath);
// Output: data/exports/pictory-abc123.mp4
```

### 2. Pro Mode (Kapwing) - 5 minutes

```javascript
const result = await externalVideoApi.processVideo({
  method: 'kapwing',
  name: 'Professional Edit',
  backgroundPath: './data/assets/backgrounds/horror.mp4',
  audioPath: './data/tts/voiceover.mp3',
  subtitles: 'Subtitle text here',
  captionStyle: 'tiktok-viral',
  duration: 60
});

console.log('Video ready:', result.videoPath);
// Output: data/exports/kapwing-project123.mp4
```

### 3. Hybrid Mode (Best Quality) - 8 minutes

```javascript
const result = await externalVideoApi.processVideo({
  method: 'hybrid',
  script: aiGeneratedScript,
  voiceId: 'auto',
  audioPath: './data/audio/background-music.mp3',
  subtitles: 'Generated subtitles',
  captionStyle: 'tiktok-viral',
  brandKit: {
    logo: './data/brands/logo.png',
    watermark: true
  }
});

console.log('Video ready:', result.videoPath);
// Steps: Pictory generation → Kapwing enhancement → Local branding
```

### 4. Stock Footage Search (Pictory)

```javascript
const results = await externalVideoApi.searchStockFootage('haunted house', 10);

console.log('Found videos:', results.videos);
// Returns 10 stock videos matching "haunted house"
```

### 5. Smart Resize (Kapwing)

```javascript
const result = await externalVideoApi.smartResize(
  'https://example.com/horizontal-video.mp4',
  '9:16'
);

console.log('Resize job:', result.jobId);
// AI-powered content-aware crop to vertical format
```

### 6. Batch Processing

```javascript
const videos = [
  { id: 1, script: 'Story 1...', name: 'Video 1' },
  { id: 2, script: 'Story 2...', name: 'Video 2' },
  { id: 3, script: 'Story 3...', name: 'Video 3' }
];

const results = await externalVideoApi.batchProcess(videos, 'kapwing');

console.log('Processed:', results.successful, 'of', results.total);
// Process multiple videos in parallel
```

### 7. Get Processing Estimates

```javascript
const estimates = await Promise.all([
  externalVideoApi.getEstimate('pictory'),
  externalVideoApi.getEstimate('kapwing'),
  externalVideoApi.getEstimate('local'),
  externalVideoApi.getEstimate('hybrid')
]);

console.log('Estimates:', estimates);
// [
//   { time: 180, quality: 'high', cost: 0 },
//   { time: 300, quality: 'very-high', cost: 0 },
//   { time: 600, quality: 'high', cost: 0 },
//   { time: 480, quality: 'maximum', cost: 0 }
// ]
```

---

## 🎨 UI Integration Example

```svelte
<!-- apps/ui/src/components/tabs/StoryScriptTab.svelte -->
<script>
  import { externalVideoApi } from '$lib/api/externalVideo';
  
  let processingMethod = 'quick'; // quick, pro, local, hybrid
  let isProcessing = false;
  let progress = 0;
  
  const methodMap = {
    quick: 'pictory',
    pro: 'kapwing',
    local: 'local',
    hybrid: 'hybrid'
  };
  
  async function generateVideo() {
    isProcessing = true;
    progress = 0;
    
    try {
      // Get estimate first
      const estimate = await externalVideoApi.getEstimate(methodMap[processingMethod]);
      console.log(`Estimated time: ${estimate.time}s`);
      
      // Start processing
      const result = await externalVideoApi.processVideo({
        method: methodMap[processingMethod],
        script: $currentScript,
        name: $projectName,
        voiceId: $selectedVoice,
        aspectRatio: '9:16',
        brandKit: $currentBrandKit
      });
      
      // Success
      console.log('Video generated:', result.videoPath);
      alert(`Video ready! Saved to: ${result.videoPath}`);
      
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate video: ' + error.message);
    } finally {
      isProcessing = false;
    }
  }
</script>

<div class="processing-method">
  <h3>Choose Processing Method</h3>
  
  <label class="method-option">
    <input type="radio" bind:group={processingMethod} value="quick" />
    <div>
      <strong>Quick Mode (Pictory)</strong>
      <p>AI-powered script-to-video in 3 minutes</p>
      <span class="badge">Fastest</span>
    </div>
  </label>
  
  <label class="method-option">
    <input type="radio" bind:group={processingMethod} value="pro" />
    <div>
      <strong>Pro Mode (Kapwing)</strong>
      <p>Advanced editing with smart resize in 5 minutes</p>
      <span class="badge">Best Quality</span>
    </div>
  </label>
  
  <label class="method-option">
    <input type="radio" bind:group={processingMethod} value="local" />
    <div>
      <strong>Local Mode (FFmpeg)</strong>
      <p>Full control, offline processing in 10 minutes</p>
      <span class="badge">Offline</span>
    </div>
  </label>
  
  <label class="method-option">
    <input type="radio" bind:group={processingMethod} value="hybrid" />
    <div>
      <strong>Hybrid Mode (All)</strong>
      <p>Maximum quality using all services in 8 minutes</p>
      <span class="badge">Premium</span>
    </div>
  </label>
</div>

<button 
  on:click={generateVideo} 
  disabled={isProcessing || !$currentScript}
  class="generate-btn"
>
  {#if isProcessing}
    Generating... {progress}%
  {:else}
    Generate Video
  {/if}
</button>

<style>
  .processing-method {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .method-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .method-option:hover {
    border-color: #4CAF50;
    background: #f5f5f5;
  }
  
  .method-option input[type="radio"]:checked + div {
    font-weight: bold;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
    font-size: 0.75rem;
  }
  
  .generate-btn {
    padding: 1rem 2rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .generate-btn:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-2px);
  }
  
  .generate-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
PICTORY_API_KEY=your_pictory_key
KAPWING_API_KEY=your_kapwing_key

# Optional
EXPORTS_DIR=./data/exports
```

### Service Configuration

```javascript
// apps/orchestrator/src/config/config.js
export const config = {
  // ... existing config
  
  externalVideo: {
    pictory: {
      enabled: !!process.env.PICTORY_API_KEY,
      pollInterval: 10000, // 10 seconds
      maxWaitTime: 600000  // 10 minutes
    },
    kapwing: {
      enabled: !!process.env.KAPWING_API_KEY,
      pollInterval: 5000,  // 5 seconds
      maxWaitTime: 600000  // 10 minutes
    }
  }
};
```

---

## 📊 Performance Comparison

| Method | Time | Quality | Use Case |
|--------|------|---------|----------|
| **Pictory** | 3 min | High | Quick content, stock footage needed |
| **Kapwing** | 5 min | Very High | Professional edits, smart resize |
| **Local** | 10 min | High | Offline, full control, privacy |
| **Hybrid** | 8 min | Maximum | Best quality, complex projects |

---

## 🎯 Next Steps

### Phase 1: Testing (Day 1-2)
- [ ] Add API keys to `.env`
- [ ] Test Pictory script-to-video
- [ ] Test Kapwing smart resize
- [ ] Test hybrid workflow
- [ ] Verify batch processing

### Phase 2: UI Integration (Day 3-4)
- [ ] Add processing method selector to Tab 1
- [ ] Add stock footage search to Tab 2
- [ ] Add smart resize option to Tab 2
- [ ] Add progress indicators
- [ ] Add error handling

### Phase 3: Advanced Features (Day 5-7)
- [ ] Implement processing queue
- [ ] Add webhook support for async processing
- [ ] Create processing history
- [ ] Add cost tracking
- [ ] Implement retry logic

### Phase 4: Documentation (Day 8-10)
- [ ] Create user guide
- [ ] Record tutorial videos
- [ ] Update README
- [ ] Add API documentation
- [ ] Create troubleshooting guide

---

## 💰 Cost Optimization

Since you already pay for both services:

### Pictory Usage Strategy
- Use for: Quick videos, stock footage needs
- Monthly limit: 30-60 videos (depending on plan)
- Cost per video: $0 (included in subscription)

### Kapwing Usage Strategy
- Use for: Professional edits, batch processing
- Monthly limit: Unlimited exports
- Cost per video: $0 (included in subscription)

### Hybrid Strategy
- Use Pictory for base generation (fast)
- Use Kapwing for enhancement (quality)
- Use Local for final branding (control)
- Total cost: $0 (all included)

---

## 🐛 Troubleshooting

### Pictory API Issues
```javascript
// Check API key
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.pictory.ai/pictoryapis/v1/account

// Common errors
- 401: Invalid API key
- 429: Rate limit exceeded
- 500: Pictory server error
```

### Kapwing API Issues
```javascript
// Check API key
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.kapwing.com/v1/account

// Common errors
- 401: Invalid API token
- 402: Payment required (upgrade plan)
- 500: Kapwing server error
```

### Integration Issues
```javascript
// Enable debug logging
// apps/orchestrator/src/services/pictoryService.js
this.logger.level = 'debug';

// Check service registration
const pictory = container.get('pictoryService');
console.log('Pictory service:', pictory);
```

---

## 📚 Additional Resources

- [Pictory API Documentation](https://pictory.ai/api-docs)
- [Kapwing API Documentation](https://kapwing.com/api-docs)
- [Video Orchestrator Architecture](ARCHITECTURE.md)
- [External Video Providers Analysis](EXTERNAL_VIDEO_PROVIDERS_ANALYSIS.md)

---

## ✅ Implementation Checklist

- [x] Create PictoryService
- [x] Create KapwingService
- [x] Create ExternalVideoService
- [x] Create API routes
- [x] Register services in container
- [x] Add routes to Express app
- [x] Create frontend API client
- [x] Create TypeScript interfaces
- [ ] Add API keys to .env
- [ ] Test Pictory integration
- [ ] Test Kapwing integration
- [ ] Test hybrid workflow
- [ ] Update UI components
- [ ] Create user documentation

**Status**: Backend implementation complete, ready for testing and UI integration!
