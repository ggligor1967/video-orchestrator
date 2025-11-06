# Video Orchestrator - API Documentation

## Base URL
```
http://127.0.0.1:4545
```

## Authentication
No authentication required for local development.

---

## Table of Contents
1. [Health & Status](#health--status)
2. [AI Services](#ai-services)
3. [Asset Management](#asset-management)
4. [Video Processing](#video-processing)
5. [Audio Processing](#audio-processing)
6. [TTS (Text-to-Speech)](#tts-text-to-speech)
7. [Subtitles](#subtitles)
8. [Export](#export)
9. [Pipeline](#pipeline)

---

## Health & Status

### Get Health Status
Check backend health and tool availability.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T12:00:00.000Z",
  "service": "video-orchestrator",
  "version": "1.0.0"
}
```

### Get API Information
Get API overview and available endpoints.

**Endpoint:** `GET /`

**Response:**
```json
{
  "name": "Video Orchestrator API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "ai": "/ai/script",
    "assets": "/assets/backgrounds",
    "video": "/video/*",
    "audio": "/audio/*",
    "tts": "/tts/generate",
    "subs": "/subs/generate",
    "export": "/export/compile",
    "pipeline": "/pipeline/build"
  }
}
```

---

## AI Services

### Generate Script
Generate AI-powered video script with hooks and hashtags.

**Endpoint:** `POST /ai/script`

**Request Body:**
```json
{
  "topic": "haunted mansion mystery",
  "genre": "horror",
  "duration": 60
}
```

**Parameters:**
- `topic` (string, required): Script topic/theme
- `genre` (string, required): One of: `horror`, `mystery`, `paranormal`, `true crime`
- `duration` (number, optional): Target duration in seconds (default: 60)

**Response:**
```json
{
  "data": {
    "script": "On a dark and stormy night in 1887, the Anderson family moved into Blackwood Manor...",
    "hooks": [
      "What they found in the basement changed everything...",
      "No one expected what happened next..."
    ],
    "hashtags": [
      "#horror",
      "#hauntedhouse",
      "#mystery",
      "#scary",
      "#truecrime"
    ]
  }
}
```

**Error Response:**
```json
{
  "error": "Validation error",
  "details": "Genre must be one of: horror, mystery, paranormal, true crime"
}
```

---

## Asset Management

### List Backgrounds
Get all imported background videos.

**Endpoint:** `GET /assets/backgrounds`

**Response:**
```json
{
  "data": [
    {
      "id": "bg_123abc",
      "filename": "parkour-city.mp4",
      "path": "/static/assets/backgrounds/parkour-city.mp4",
      "duration": 120,
      "size": 45678910,
      "resolution": "1920x1080",
      "fps": 30,
      "imported": "2025-10-13T10:00:00.000Z"
    }
  ]
}
```

### Import Background Video
Upload a new background video.

**Endpoint:** `POST /assets/backgrounds/import`

**Request:** `multipart/form-data`
```
video: <file>
```

**Response:**
```json
{
  "data": {
    "id": "bg_456def",
    "filename": "minecraft-gameplay.mp4",
    "path": "/static/assets/backgrounds/minecraft-gameplay.mp4",
    "duration": 180,
    "message": "Background video imported successfully"
  }
}
```

### Get Background Info
Get detailed information about a specific background.

**Endpoint:** `GET /assets/backgrounds/:id/info`

**Response:**
```json
{
  "data": {
    "id": "bg_123abc",
    "filename": "parkour-city.mp4",
    "path": "/static/assets/backgrounds/parkour-city.mp4",
    "duration": 120,
    "size": 45678910,
    "resolution": "1920x1080",
    "fps": 30,
    "codec": "h264",
    "bitrate": 8000000
  }
}
```

### Delete Background
Remove a background video.

**Endpoint:** `DELETE /assets/backgrounds/:id`

**Response:**
```json
{
  "message": "Background deleted successfully",
  "id": "bg_123abc"
}
```

---

## Video Processing

### Crop to Vertical
Convert 16:9 video to 9:16 vertical format.

**Endpoint:** `POST /video/crop`

**Request Body:**
```json
{
  "inputPath": "/static/assets/backgrounds/wide-video.mp4",
  "outputPath": "/static/cache/video/cropped-123.mp4",
  "position": "center"
}
```

**Parameters:**
- `inputPath` (string, required): Input video path
- `outputPath` (string, required): Output video path
- `position` (string, optional): Crop position (`center`, `left`, `right`) - default: `center`

**Response:**
```json
{
  "data": {
    "outputPath": "/static/cache/video/cropped-123.mp4",
    "duration": 120,
    "resolution": "1080x1920",
    "size": 35678910
  }
}
```

### Apply Speed Ramp
Add progressive zoom effect to video.

**Endpoint:** `POST /video/speed-ramp`

**Request Body:**
```json
{
  "inputPath": "/static/cache/video/cropped-123.mp4",
  "outputPath": "/static/cache/video/ramped-123.mp4",
  "startTime": 2.0,
  "zoomFactor": 1.2,
  "duration": 58
}
```

**Response:**
```json
{
  "data": {
    "outputPath": "/static/cache/video/ramped-123.mp4",
    "duration": 60,
    "effect": "speed_ramp",
    "zoomFactor": 1.2
  }
}
```

### Merge Video and Audio
Combine video with audio track.

**Endpoint:** `POST /video/merge-audio`

**Request Body:**
```json
{
  "videoPath": "/static/cache/video/ramped-123.mp4",
  "audioPath": "/static/cache/audio/mixed-123.mp3",
  "outputPath": "/static/cache/video/final-123.mp4"
}
```

**Response:**
```json
{
  "data": {
    "outputPath": "/static/cache/video/final-123.mp4",
    "duration": 60,
    "videoCodec": "h264",
    "audioCodec": "aac"
  }
}
```

---

## Audio Processing

### Normalize Audio
Apply loudness normalization to audio file.

**Endpoint:** `POST /audio/normalize`

**Request Body:**
```json
{
  "inputPath": "/static/tts/voiceover-123.mp3",
  "outputPath": "/static/cache/audio/normalized-123.mp3",
  "targetLUFS": -16,
  "peakLimit": -1.0
}
```

**Response:**
```json
{
  "data": {
    "outputPath": "/static/cache/audio/normalized-123.mp3",
    "duration": 58.5,
    "loudness": -16.2,
    "peak": -0.8
  }
}
```

### Mix Audio Tracks
Combine multiple audio sources (voice, music, SFX).

**Endpoint:** `POST /audio/mix`

**Request Body:**
```json
{
  "tracks": [
    {
      "path": "/static/tts/voiceover-123.mp3",
      "volume": 1.0,
      "type": "voice"
    },
    {
      "path": "/static/assets/music/background.mp3",
      "volume": 0.3,
      "type": "music"
    }
  ],
  "outputPath": "/static/cache/audio/mixed-123.mp3",
  "ducking": true
}
```

**Response:**
```json
{
  "data": {
    "outputPath": "/static/cache/audio/mixed-123.mp3",
    "duration": 60,
    "tracks": 2,
    "loudness": -16.0
  }
}
```

---

## TTS (Text-to-Speech)

### Generate Voice-Over
Convert text to speech using Piper TTS.

**Endpoint:** `POST /tts/generate`

**Request Body:**
```json
{
  "text": "On a dark and stormy night in 1887, the Anderson family moved into Blackwood Manor. Little did they know, they were not alone...",
  "voice": "en_US-amy-medium",
  "speed": 1.0,
  "outputPath": "/static/tts/voiceover-123.mp3"
}
```

**Parameters:**
- `text` (string, required): Text to convert to speech
- `voice` (string, optional): Voice model name (default: `en_US-amy-medium`)
- `speed` (number, optional): Speech speed multiplier (default: 1.0)
- `outputPath` (string, optional): Output file path

**Response:**
```json
{
  "data": {
    "outputPath": "/static/tts/voiceover-123.mp3",
    "duration": 58.5,
    "voice": "en_US-amy-medium",
    "wordCount": 142
  }
}
```

### List Available Voices
Get all installed TTS voices.

**Endpoint:** `GET /tts/voices`

**Response:**
```json
{
  "data": [
    {
      "id": "en_US-amy-medium",
      "name": "Amy (US English)",
      "language": "en_US",
      "gender": "female",
      "quality": "medium"
    },
    {
      "id": "en_US-ryan-medium",
      "name": "Ryan (US English)",
      "language": "en_US",
      "gender": "male",
      "quality": "medium"
    }
  ]
}
```

---

## Subtitles

### Generate Subtitles
Create SRT subtitles from audio using Whisper.

**Endpoint:** `POST /subs/generate`

**Request Body:**
```json
{
  "audioPath": "/static/tts/voiceover-123.mp3",
  "outputPath": "/static/subs/subtitles-123.srt",
  "model": "base.en",
  "maxLineWidth": 42
}
```

**Response:**
```json
{
  "data": {
    "outputPath": "/static/subs/subtitles-123.srt",
    "duration": 58.5,
    "segments": 28,
    "wordCount": 142
  }
}
```

### Format Subtitles
Apply styling to subtitle file.

**Endpoint:** `POST /subs/format`

**Request Body:**
```json
{
  "inputPath": "/static/subs/subtitles-123.srt",
  "outputPath": "/static/subs/styled-123.srt",
  "style": {
    "maxWordsPerLine": 3,
    "maxCharsPerLine": 42,
    "uppercase": true,
    "alignment": "center"
  }
}
```

**Response:**
```json
{
  "data": {
    "outputPath": "/static/subs/styled-123.srt",
    "segments": 28,
    "style": "formatted"
  }
}
```

---

## Export

### Compile Final Video
Create final video with all elements combined.

**Endpoint:** `POST /export/compile`

**Request Body:**
```json
{
  "videoPath": "/static/cache/video/final-123.mp4",
  "subsPath": "/static/subs/styled-123.srt",
  "outputPath": "/static/exports/video-123.mp4",
  "preset": "tiktok",
  "burnSubtitles": true,
  "addOverlays": {
    "progressBar": true,
    "partBadge": "Part 1"
  }
}
```

**Parameters:**
- `preset` (string, optional): Export preset (`tiktok`, `youtube-shorts`, `instagram-reels`)
- `burnSubtitles` (boolean, optional): Embed subtitles into video

**Response:**
```json
{
  "data": {
    "outputPath": "/static/exports/video-123.mp4",
    "duration": 60,
    "size": 48000000,
    "resolution": "1080x1920",
    "bitrate": 8000000,
    "preset": "tiktok"
  }
}
```

### Get Export Presets
List available export configurations.

**Endpoint:** `GET /export/presets`

**Response:**
```json
{
  "data": [
    {
      "id": "tiktok",
      "name": "TikTok",
      "resolution": "1080x1920",
      "fps": 30,
      "videoBitrate": 8000000,
      "audioBitrate": 192000,
      "maxDuration": 180
    },
    {
      "id": "youtube-shorts",
      "name": "YouTube Shorts",
      "resolution": "1080x1920",
      "fps": 30,
      "videoBitrate": 12000000,
      "audioBitrate": 192000,
      "maxDuration": 60
    }
  ]
}
```

---

## Pipeline

### Build Complete Video
Run end-to-end pipeline to create finished video.

**Endpoint:** `POST /pipeline/build`

**Request Body:**
```json
{
  "script": "On a dark and stormy night...",
  "backgroundId": "bg_123abc",
  "voice": "en_US-amy-medium",
  "musicPath": "/static/assets/music/background.mp3",
  "preset": "tiktok",
  "options": {
    "speedRamp": true,
    "subtitles": true,
    "progressBar": true
  }
}
```

**Response:**
```json
{
  "data": {
    "jobId": "job_789xyz",
    "status": "processing",
    "progress": 0,
    "message": "Pipeline started"
  }
}
```

### Get Pipeline Status
Check progress of pipeline job.

**Endpoint:** `GET /pipeline/status/:jobId`

**Response:**
```json
{
  "data": {
    "jobId": "job_789xyz",
    "status": "completed",
    "progress": 100,
    "steps": {
      "tts": "completed",
      "video": "completed",
      "audio": "completed",
      "subtitles": "completed",
      "export": "completed"
    },
    "outputPath": "/static/exports/video-123.mp4",
    "duration": 60,
    "completedAt": "2025-10-13T12:05:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limits
No rate limits for local development.

## CORS
Enabled for origins:
- `http://127.0.0.1:1421`
- `http://localhost:1421`
- `http://localhost:5173`
- `tauri://localhost`

---

## Notes
- All file paths are relative to the `data/` directory
- Static files are served at `/static/*`
- Temporary processing files are stored in `data/cache/`
- Final exports are saved in `data/exports/`
