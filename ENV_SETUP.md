# Environment Configuration Guide

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your API keys:**
   Open `.env` in a text editor and add your credentials.

3. **Restart the application** for changes to take effect.

## Required Configuration

### Server Settings (Required)

- **PORT**: Server port (default: `4545`)
  - ⚠️ **DO NOT CHANGE** - This port is hardcoded across UI and backend
- **NODE_ENV**: Environment mode (`development`, `production`, `test`)
- **LOG_LEVEL**: Logging verbosity (`error`, `warn`, `info`, `debug`)

### AI Script Generation (At Least One Required)

**Option 1: OpenAI (Recommended)**
```bash
OPENAI_API_KEY=sk-...your-key-here...
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```
- Get your key: https://platform.openai.com/api-keys
- Cost: ~$0.15 per 1M input tokens (gpt-4o-mini)

**Option 2: Google Gemini**
```bash
GEMINI_API_KEY=...your-key-here...
AI_PROVIDER=gemini
```
- Get your key: https://makersuite.google.com/app/apikey
- Cost: Free tier available, then ~$0.075 per 1M input tokens

**Option 3: Mock (Development Only)**
```bash
AI_PROVIDER=mock
```
- No API key needed
- Returns placeholder scripts for testing

## Optional Configuration

### Stock Media Services (Optional)

**Pexels** - Free high-quality video backgrounds
```bash
PEXELS_API_KEY=...your-key-here...
```
- Get your key: https://www.pexels.com/api/
- Free tier: 200 requests/hour

**Pixabay** - Additional video sources
```bash
PIXABAY_API_KEY=...your-key-here...
```
- Get your key: https://pixabay.com/api/docs/
- Free tier: 5,000 requests/day

### Social Media Integration (Coming Soon)

These features are planned but not yet implemented:
```bash
# TikTok API (Module 7)
# TIKTOK_CLIENT_KEY=...
# TIKTOK_CLIENT_SECRET=...

# YouTube API (Module 7)
# YOUTUBE_CLIENT_ID=...
# YOUTUBE_CLIENT_SECRET=...

# Instagram API (Module 7)
# INSTAGRAM_CLIENT_ID=...
# INSTAGRAM_CLIENT_SECRET=...
```

### Local Tools Configuration (Auto-detected)

The application automatically detects tools in the `tools/` directory. Only configure these if you have custom installations:

```bash
# Custom FFmpeg installation
# FFMPEG_PATH=D:/custom/path/to/ffmpeg.exe

# Custom Piper TTS installation
# PIPER_PATH=D:/custom/path/to/piper.exe

# Custom Whisper.cpp installation  
# WHISPER_PATH=D:/custom/path/to/whisper.exe

# Custom Godot installation (for voxel generator)
# GODOT_PATH=D:/custom/path/to/godot.exe
```

### Advanced Settings

```bash
# File upload limits
MAX_FILE_SIZE=524288000  # 500MB default

# Video processing timeouts (milliseconds)
VIDEO_TIMEOUT=300000     # 5 minutes
TTS_TIMEOUT=60000        # 1 minute
SUBS_TIMEOUT=120000      # 2 minutes

# Cleanup settings
CLEANUP_ENABLED=true
CLEANUP_INTERVAL=3600000  # 1 hour
CLEANUP_MAX_AGE=86400000  # 24 hours

# Debug modes
FFMPEG_DEBUG=false       # Log FFmpeg commands
AI_DEBUG=false           # Log AI requests
ENABLE_HTTP_LOGGING=true # Log HTTP requests
```

## Platform-Specific Notes

### Windows
- Use forward slashes or escaped backslashes in paths:
  ```bash
  FFMPEG_PATH=D:/tools/ffmpeg/bin/ffmpeg.exe
  # or
  FFMPEG_PATH=D:\\tools\\ffmpeg\\bin\\ffmpeg.exe
  ```

### macOS / Linux
- Use absolute paths:
  ```bash
  FFMPEG_PATH=/usr/local/bin/ffmpeg
  PIPER_PATH=/opt/piper/piper
  ```

## Verification

After configuring your `.env` file, verify the setup:

1. **Start the orchestrator backend:**
   ```bash
   pnpm --filter @app/orchestrator dev
   ```

2. **Check startup logs:**
   - ✅ FFmpeg detected
   - ✅ Piper TTS detected  
   - ✅ Whisper detected
   - ✅ AI provider initialized (openai/gemini/mock)
   - ✅ Server listening on port 4545

3. **Test AI script generation:**
   ```bash
   curl -X POST http://127.0.0.1:4545/ai/script \
     -H "Content-Type: application/json" \
     -d '{"topic": "test", "genre": "horror"}'
   ```

## Troubleshooting

### "AI provider not configured"
- Set `AI_PROVIDER` to `openai`, `gemini`, or `mock`
- Add corresponding API key (`OPENAI_API_KEY` or `GEMINI_API_KEY`)

### "FFmpeg not found"
- Install FFmpeg in `tools/ffmpeg/` directory
- Or set `FFMPEG_PATH` to your system FFmpeg installation

### "Port 4545 already in use"
- ⚠️ **DO NOT** change `PORT` - UI expects 4545
- Stop other processes using port 4545
- On Windows: `netstat -ano | findstr :4545` then `taskkill /PID <pid> /F`

### "CORS error" when connecting UI to backend
- Add UI origin to `CORS_ORIGINS`:
  ```bash
  CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:1421,tauri://localhost
  ```

## Security Best Practices

1. **Never commit `.env` to version control**
   - Already in `.gitignore`
   - Always use `.env.example` as template

2. **Keep API keys secure**
   - Don't share keys publicly
   - Rotate keys if accidentally exposed
   - Use environment-specific keys (dev vs prod)

3. **Use minimal permissions**
   - OpenAI: Only enable text generation models
   - Pexels/Pixabay: Read-only API keys

4. **Monitor API usage**
   - Check billing dashboards regularly
   - Set usage alerts/limits on provider platforms

## Production Deployment

For production builds (MSI installer):

1. **Do NOT include `.env` in the installer**
   - Users configure their own keys after installation

2. **Provide setup wizard:**
   - Prompt for API keys on first launch
   - Save to user-specific config location

3. **Bundle tools:**
   - Include FFmpeg, Piper, Whisper in installer
   - No need for `FFMPEG_PATH` etc. configuration

4. **Set production defaults:**
   ```bash
   NODE_ENV=production
   LOG_LEVEL=warn
   ENABLE_HTTP_LOGGING=false
   ```

## Need Help?

- **Documentation**: See `assets/` folder for detailed module specs
- **API Reference**: Check `apps/orchestrator/src/routes/` for endpoint docs
- **Support**: Create an issue on GitHub (if applicable)
