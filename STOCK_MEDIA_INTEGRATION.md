# Stock Media Integration - Documentation

## Overview

The Stock Media Integration feature allows Video Orchestrator to search, download, and use royalty-free stock videos from **Pexels** and **Pixabay** directly within the application. This eliminates the barrier of requiring users to have their own media library.

## Features

✅ **Multi-Provider Search** - Search videos from Pexels and Pixabay simultaneously
✅ **AI-Powered Suggestions** - Get video recommendations based on your script content
✅ **Local Caching** - Downloaded videos are cached to avoid re-downloading
✅ **Vertical Video Optimization** - Prioritizes 9:16 portrait videos for TikTok/Shorts
✅ **Mock Mode** - Works without API keys for testing purposes
✅ **Metadata Rich** - Returns complete video information (duration, resolution, author, license)

## Quick Start

### 1. Get API Keys

#### Pexels API Key
1. Visit https://www.pexels.com/api/
2. Sign up for a free account
3. Request an API key (free tier: 200 requests/hour)

#### Pixabay API Key
1. Visit https://pixabay.com/api/docs/
2. Sign up for a free account
3. Get your API key (free tier: 5,000 requests/hour)

### 2. Configure Environment Variables

Add the API keys to `apps/orchestrator/.env`:

```bash
# Stock Media API Keys
PEXELS_API_KEY=your-pexels-api-key-here
PIXABAY_API_KEY=your-pixabay-api-key-here
```

### 3. Restart the Backend

```bash
pnpm --filter @app/orchestrator dev
```

## API Endpoints

### Search Stock Videos

**Endpoint:** `GET /stock/search`

**Query Parameters:**
- `query` (required) - Search keywords (e.g., "haunted house")
- `orientation` (optional) - Video orientation: `portrait`, `landscape`, `square` (default: `portrait`)
- `size` (optional) - Video quality: `small`, `medium`, `large` (default: `medium`)
- `perPage` (optional) - Results per page: 1-50 (default: 15)
- `page` (optional) - Page number (default: 1)
- `minDuration` (optional) - Minimum duration in seconds (default: 5)
- `maxDuration` (optional) - Maximum duration in seconds (default: 120)

**Example Request:**
```bash
curl "http://127.0.0.1:4545/stock/search?query=spooky+forest&orientation=portrait&perPage=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "pexels-12345",
        "provider": "pexels",
        "title": "Spooky Forest Video",
        "description": "Video by John Doe",
        "duration": 15.5,
        "width": 1080,
        "height": 1920,
        "thumbnail": "https://...",
        "tags": ["forest", "spooky", "fog", "trees"],
        "author": {
          "name": "John Doe",
          "url": "https://..."
        },
        "videoFiles": [
          {
            "quality": "hd",
            "width": 1080,
            "height": 1920,
            "fileType": "video/mp4",
            "link": "https://...",
            "fps": 30
          }
        ],
        "url": "https://...",
        "license": "Pexels License (Free to use)",
        "licenseUrl": "https://www.pexels.com/license/"
      }
    ],
    "query": "spooky forest",
    "page": 1,
    "perPage": 10,
    "totalResults": 10
  }
}
```

---

### Get AI-Powered Video Suggestions

**Endpoint:** `POST /stock/suggestions`

**Request Body:**
```json
{
  "script": "In the dead of night, an abandoned lighthouse stands alone...",
  "genre": "horror",
  "maxSuggestions": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "pexels-67890",
        "provider": "pexels",
        "title": "Lighthouse at Night",
        "relevanceScore": 25,
        "...": "..."
      }
    ],
    "count": 10
  }
}
```

**How It Works:**
1. AI analyzes your script and extracts 3-5 visual keywords
2. Searches for videos matching those keywords
3. Ranks results by relevance (keyword matching, orientation, duration, quality)
4. Returns top suggestions sorted by relevance score

---

### Download and Cache Video

**Endpoint:** `POST /stock/download`

**Request Body:**
```json
{
  "videoId": "pexels-12345",
  "videoUrl": "https://player.vimeo.com/external/...",
  "quality": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "pexels-12345",
    "localPath": "/data/cache/stock-videos/abc123-medium.mp4",
    "quality": "medium"
  }
}
```

**Cache Behavior:**
- Videos are cached in `data/cache/stock-videos/`
- Cached videos are reused to save bandwidth
- Cache can be cleared via the API

---

### Get Video Details

**Endpoint:** `GET /stock/video/:videoId`

**Example:**
```bash
curl "http://127.0.0.1:4545/stock/video/pexels-12345"
```

**Response:** Returns full video metadata

---

### Get Cache Statistics

**Endpoint:** `GET /stock/cache/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "fileCount": 15,
    "totalSize": 524288000,
    "totalSizeMB": "500.00"
  }
}
```

---

### Clear Cache

**Endpoint:** `DELETE /stock/cache`

**Response:**
```json
{
  "success": true,
  "data": {
    "filesDeleted": 15
  },
  "message": "Cache cleared successfully"
}
```

## Integration in Video Pipeline

The stock media service can be integrated into the video creation pipeline:

```javascript
// 1. Generate script
const script = await fetch('http://127.0.0.1:4545/ai/script', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'haunted lighthouse',
    genre: 'horror',
    duration: 60
  })
});

// 2. Get AI-powered background suggestions
const suggestions = await fetch('http://127.0.0.1:4545/stock/suggestions', {
  method: 'POST',
  body: JSON.stringify({
    script: script.data.script,
    genre: 'horror',
    maxSuggestions: 5
  })
});

// 3. Download the best video
const bestVideo = suggestions.data.suggestions[0];
const download = await fetch('http://127.0.0.1:4545/stock/download', {
  method: 'POST',
  body: JSON.stringify({
    videoId: bestVideo.id,
    videoUrl: bestVideo.videoFiles[0].link,
    quality: 'medium'
  })
});

// 4. Use the local path in video processing
const localPath = download.data.localPath;
// Continue with video/crop, tts/generate, etc.
```

## Mock Mode (Testing Without API Keys)

If no API keys are configured, the service automatically returns mock data:

```javascript
// Without API keys, you'll get 15 mock videos
{
  "id": "mock-1",
  "provider": "mock",
  "title": "Mock haunted house video 1",
  "description": "Mock video for testing",
  "duration": 25.5,
  "width": 1080,
  "height": 1920,
  "thumbnail": "https://via.placeholder.com/1080x1920",
  "tags": ["haunted house", "vertical", "stock"],
  "videoFiles": [{
    "quality": "medium",
    "link": "https://www.w3schools.com/html/mov_bbb.mp4"
  }]
}
```

This allows full testing of the UI and workflow without requiring API access.

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "query",
          "message": "Search query is required"
        }
      ]
    }
  }
}
```

**401 Unauthorized** - Invalid API key
**429 Too Many Requests** - Rate limit exceeded (wait and retry)
**500 Internal Server Error** - API provider error

### Retry Logic

The service automatically retries failed requests with exponential backoff:
- Pexels fails → Try Pixabay
- Both fail → Return mock data (if configured)

## Licensing

### Pexels License
- **Free to use** for personal and commercial projects
- **No attribution required** (but appreciated)
- Cannot sell or redistribute the videos themselves
- Full license: https://www.pexels.com/license/

### Pixabay License
- **Free to use** for personal and commercial projects
- **No attribution required**
- Cannot redistribute videos as stock footage
- Full license: https://pixabay.com/service/license/

**Important:** Always include proper attribution in your video description when publishing to social media.

## Performance Considerations

### Rate Limits
- **Pexels:** 200 requests/hour (free tier)
- **Pixabay:** 5,000 requests/hour (free tier)

### Optimization Tips
1. **Use caching** - Downloaded videos are automatically cached
2. **Batch requests** - Use AI suggestions to get multiple videos in one call
3. **Filter wisely** - Use `orientation=portrait` and `minDuration`/`maxDuration` to reduce results
4. **Implement client-side pagination** - Don't load all results at once

### Cache Management
- Cache directory: `data/cache/stock-videos/`
- Videos are named by MD5 hash of video ID + quality
- Consider periodic cleanup (e.g., monthly) to manage disk space
- Use `GET /stock/cache/stats` to monitor cache size

## Architecture

### Service Layer (`stockMediaService.js`)
- Handles API communication with Pexels and Pixabay
- Implements caching logic
- AI keyword extraction using existing aiService
- Relevance scoring algorithm

### Controller Layer (`stockMediaController.js`)
- Request validation using Zod schemas
- Error handling
- Response formatting

### Routes (`stockMedia.js`)
- RESTful endpoint definitions
- Mounted at `/stock`

### Container Integration
- Service registered as singleton with DI
- Depends on: `logger`, `config`, `aiService`

## Future Enhancements

🔜 **Image Search** - Add support for stock images alongside videos
🔜 **Video Filters** - Add color grading, filters preview
🔜 **Favorites** - Save frequently used videos
🔜 **Auto-Select** - Automatically pick best video based on script
🔜 **Bulk Download** - Download multiple videos at once
🔜 **Premium Providers** - Integrate with Shutterstock, Getty Images

## Troubleshooting

### Issue: "No API keys configured, using mock results"
**Solution:** Add `PEXELS_API_KEY` and/or `PIXABAY_API_KEY` to `.env` file

### Issue: "Invalid Pexels API key"
**Solution:** Verify your API key is correct and active at https://www.pexels.com/api/

### Issue: Cache directory errors
**Solution:** Ensure `data/cache/stock-videos/` has write permissions

### Issue: Download timeouts
**Solution:** Large videos may timeout. Try:
- Use smaller quality setting (`quality: "small"`)
- Increase timeout in axios config (currently 2 minutes)
- Check your internet connection

## Testing

Run stock media tests:
```bash
pnpm --filter @app/orchestrator test
```

The integration is tested alongside all other services. Look for "Stock media cache directory initialized" in test output.

## Support

For issues or feature requests:
- Check logs in `apps/orchestrator/logs/`
- Review API provider status pages
- Test with mock mode first to isolate issues

---

**Implementation Status:** ✅ Complete
**Version:** 1.0.0
**Date:** October 14, 2025
