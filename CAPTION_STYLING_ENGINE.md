# Caption Styling Engine - Documentation

## Overview

The Caption Styling Engine provides advanced subtitle styling with animations, effects, and customizable presets for creating professional-looking captions in vertical videos. This feature allows you to transform basic SRT subtitles into visually appealing animated text that enhances viewer engagement.

## Features

✅ **6 Pre-built Style Presets** - TikTok Trending, Minimal, Karaoke, Neon Glow, Classic, Bold Impact
✅ **Advanced Animations** - Word-by-word reveals, fade-ins, zoom effects, karaoke-style highlights
✅ **Full Customization** - Create your own custom styles with complete control
✅ **ASS Subtitle Format** - Uses Advanced SubStation Alpha for rich styling capabilities
✅ **FFmpeg Integration** - Burns styled subtitles directly into videos
✅ **Preview Generation** - Generate preview thumbnails of each style
✅ **Position Control** - Place captions at top, center, or bottom
✅ **Font Styling** - Custom fonts, sizes, colors, and spacing
✅ **Visual Effects** - Backgrounds, strokes, shadows, glows

## Quick Start

### 1. Apply a Preset Style

```bash
curl -X POST http://127.0.0.1:4545/captions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "subtitlePath": "D:\\playground\\Aplicatia\\data\\subs\\subtitles.srt",
    "videoPath": "D:\\playground\\Aplicatia\\data\\assets\\video.mp4",
    "styleId": "tiktok-trending"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outputPath": "D:\\playground\\Aplicatia\\data\\cache\\styled-subtitles\\styled-abc123.mp4",
    "styleId": "tiktok-trending"
  },
  "message": "Caption style applied successfully"
}
```

### 2. Get Available Presets

```bash
curl http://127.0.0.1:4545/captions/presets
```

**Response:**
```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "id": "tiktok-trending",
        "name": "TikTok Trending",
        "description": "Bold text with yellow box highlights, perfect for viral content",
        "animation": "word-by-word",
        "preview": "/static/caption-previews/tiktok-trending.png"
      },
      {
        "id": "minimal",
        "name": "Minimal Clean",
        "description": "Simple, elegant captions with subtle animations",
        "animation": "fade-in",
        "preview": "/static/caption-previews/minimal.png"
      },
      ...
    ],
    "count": 6
  }
}
```

## Available Style Presets

### 1. TikTok Trending
**ID:** `tiktok-trending`

Bold white text with yellow box highlights, animated word-by-word. Perfect for viral short-form content.

- **Animation:** Word-by-word reveal with delay
- **Font:** Montserrat Bold, 80px
- **Background:** Yellow box (#FFD700) with rounded corners
- **Stroke:** Black outline, 8px width
- **Position:** Center of screen
- **Best for:** Viral TikTok/Shorts content

### 2. Minimal Clean
**ID:** `minimal`

Simple, elegant white text with subtle fade-in animation. Clean and professional.

- **Animation:** Fade-in/fade-out
- **Font:** Arial, 60px
- **Background:** None
- **Shadow:** Soft black shadow
- **Position:** Bottom center with margin
- **Best for:** Professional, minimalist videos

### 3. Karaoke Style
**ID:** `karaoke`

Word-by-word color highlight effect that follows the speech.

- **Animation:** Word highlight (karaoke effect)
- **Font:** Arial Bold, 70px
- **Background:** Red underline that moves with speech
- **Highlight:** Words change color as they're spoken
- **Position:** Center of screen
- **Best for:** Music videos, lyric videos, sing-alongs

### 4. Neon Glow
**ID:** `neon-glow`

Cyberpunk-style glowing text with cyan and magenta colors.

- **Animation:** Fade-in with long duration
- **Font:** Arial Bold, 75px
- **Colors:** Cyan text with magenta stroke
- **Shadow:** Cyan glow effect (30px blur)
- **Position:** Top center
- **Best for:** Tech, gaming, futuristic content

### 5. Classic Subtitle
**ID:** `classic`

Traditional movie-style subtitles with semi-transparent black background.

- **Animation:** None (instant appearance)
- **Font:** Arial, 50px
- **Background:** Semi-transparent black box
- **Position:** Bottom center
- **Best for:** Documentary-style videos, translations

### 6. Bold Impact
**ID:** `bold-impact`

Extra bold text with strong black stroke for maximum readability.

- **Animation:** Zoom-in effect
- **Font:** Impact, 90px
- **Stroke:** Extra thick black outline (12px)
- **Shadow:** Large drop shadow
- **Position:** Center of screen
- **Best for:** Dramatic announcements, high-energy content

## API Endpoints

### Get All Presets
**Endpoint:** `GET /captions/presets`

Returns list of all available caption style presets.

**Response:**
```json
{
  "success": true,
  "data": {
    "presets": [...],
    "count": 6
  }
}
```

---

### Get Preset Details
**Endpoint:** `GET /captions/presets/:presetId`

Get complete configuration details for a specific preset.

**Example:**
```bash
curl http://127.0.0.1:4545/captions/presets/tiktok-trending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preset": {
      "id": "tiktok-trending",
      "name": "TikTok Trending",
      "description": "Bold text with yellow box highlights",
      "animation": "word-by-word",
      "font": {
        "family": "Montserrat-Bold",
        "size": 80,
        "color": "#FFFFFF",
        "spacing": 0
      },
      "background": {
        "enabled": true,
        "type": "box",
        "color": "#FFD700",
        "padding": 20,
        "borderRadius": 10
      },
      "stroke": {
        "enabled": true,
        "color": "#000000",
        "width": 8
      },
      "shadow": {
        "enabled": true,
        "color": "#00000080",
        "offsetX": 4,
        "offsetY": 4,
        "blur": 10
      },
      "position": {
        "vertical": "center",
        "horizontal": "center",
        "marginBottom": 0
      },
      "timing": {
        "fadeIn": 0.1,
        "fadeOut": 0.1,
        "wordDelay": 0.05
      }
    }
  }
}
```

---

### Apply Style to Subtitles
**Endpoint:** `POST /captions/apply`

Apply a style preset or custom style to burn subtitles into a video.

**Request Body:**
```json
{
  "subtitlePath": "D:\\data\\subs\\subtitles.srt",
  "videoPath": "D:\\data\\assets\\video.mp4",
  "styleId": "tiktok-trending",  // Optional: preset ID (default: tiktok-trending)
  "outputPath": "D:\\data\\exports\\output.mp4",  // Optional: custom output path
  "customStyle": { /* ... */ }  // Optional: override with custom style
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outputPath": "D:\\data\\cache\\styled-subtitles\\styled-abc123.mp4",
    "styleId": "tiktok-trending"
  },
  "message": "Caption style applied successfully"
}
```

**Processing Time:** Varies based on video length (typically 30-60 seconds for a 1-minute video)

---

### Generate Preview
**Endpoint:** `POST /captions/preview`

Generate a preview thumbnail image for a style preset.

**Request Body:**
```json
{
  "presetId": "tiktok-trending",
  "sampleText": "Amazing Story"  // Optional: custom preview text
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "previewPath": "D:\\data\\static\\caption-previews\\tiktok-trending.png",
    "presetId": "tiktok-trending"
  },
  "message": "Preview generated successfully"
}
```

---

### Create Custom Style
**Endpoint:** `POST /captions/styles`

Create a custom caption style with your own configuration.

**Request Body:**
```json
{
  "name": "My Custom Style",
  "description": "My awesome custom caption style",
  "animation": "fade-in",  // none, fade-in, word-by-word, word-highlight, zoom-in
  "font": {
    "family": "Arial-Bold",
    "size": 70,
    "color": "#FF0000",
    "spacing": 5
  },
  "background": {
    "enabled": true,
    "type": "box",  // box, underline
    "color": "#000000CC",
    "padding": 15,
    "borderRadius": 8
  },
  "stroke": {
    "enabled": true,
    "color": "#FFFFFF",
    "width": 6
  },
  "shadow": {
    "enabled": true,
    "color": "#00000080",
    "offsetX": 3,
    "offsetY": 3,
    "blur": 10
  },
  "position": {
    "vertical": "bottom",  // top, center, bottom
    "horizontal": "center",  // left, center, right
    "marginBottom": 100
  },
  "timing": {
    "fadeIn": 0.2,
    "fadeOut": 0.2,
    "wordDelay": 0.08
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "style": {
      "id": "custom-abc123",
      "name": "My Custom Style",
      ...
    }
  },
  "message": "Custom style created successfully"
}
```

## Custom Style Configuration

### Font Options
```json
{
  "family": "Arial",  // Font name (must be installed on system)
  "size": 60,  // Font size in pixels
  "color": "#FFFFFF",  // Hex color code
  "spacing": 0  // Letter spacing in pixels (optional)
}
```

**Available System Fonts (Windows):**
- Arial, Arial-Bold
- Times New Roman
- Courier New
- Verdana
- Tahoma
- Impact
- Comic Sans MS
- Georgia
- Palatino
- Montserrat-Bold (if installed)

### Background Options
```json
{
  "enabled": true,
  "type": "box",  // box: rectangular background, underline: line under text
  "color": "#FFD700",  // Hex color with optional alpha (#RRGGBBAA)
  "padding": 20,  // Padding around text (for box type)
  "borderRadius": 10  // Rounded corners (for box type)
}
```

### Stroke (Outline) Options
```json
{
  "enabled": true,
  "color": "#000000",  // Outline color
  "width": 8  // Outline thickness in pixels
}
```

### Shadow Options
```json
{
  "enabled": true,
  "color": "#00000080",  // Shadow color with alpha
  "offsetX": 4,  // Horizontal offset
  "offsetY": 4,  // Vertical offset
  "blur": 10  // Blur radius
}
```

### Position Options
```json
{
  "vertical": "center",  // top, center, bottom
  "horizontal": "center",  // left, center, right
  "marginBottom": 100  // Distance from bottom edge (pixels)
}
```

### Timing Options
```json
{
  "fadeIn": 0.2,  // Fade-in duration in seconds
  "fadeOut": 0.2,  // Fade-out duration in seconds
  "wordDelay": 0.05  // Delay between words (for word-by-word animation)
}
```

### Animation Types

- **`none`** - No animation, instant appearance
- **`fade-in`** - Smooth fade-in and fade-out
- **`word-by-word`** - Each word appears with a delay (TikTok style)
- **`word-highlight`** - Karaoke-style word highlighting
- **`zoom-in`** - Text zooms in slightly when appearing

## Integration Example

Complete workflow for adding styled captions to a video:

```javascript
// 1. Generate subtitle file from audio
const subsResponse = await fetch('http://127.0.0.1:4545/subs/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioPath: 'D:\\data\\tts\\voiceover.wav'
  })
});

const { outputPath: srtPath } = await subsResponse.json();

// 2. Apply caption styling
const captionsResponse = await fetch('http://127.0.0.1:4545/captions/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subtitlePath: srtPath,
    videoPath: 'D:\\data\\assets\\background.mp4',
    styleId: 'tiktok-trending'
  })
});

const { outputPath: styledVideo } = await captionsResponse.json();

// 3. Export final video
const exportResponse = await fetch('http://127.0.0.1:4545/export/compile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoPath: styledVideo,
    preset: 'tiktok'
  })
});

const { outputPath: finalVideo } = await exportResponse.json();
console.log('Final video with styled captions:', finalVideo);
```

## Technical Details

### Subtitle Format Conversion

The Caption Styling Engine automatically converts SRT (SubRip) format to ASS (Advanced SubStation Alpha) format to enable advanced styling:

**Input (SRT):**
```
1
00:00:00,000 --> 00:00:03,000
Hello world

2
00:00:03,000 --> 00:00:06,000
This is amazing
```

**Output (ASS with styling):**
```ass
[Script Info]
Title: Styled Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, ...
Style: Default,Montserrat-Bold,80,&H00FFFFFF,&H00000000,...

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:03.00,Default,,0,0,0,,Hello world
Dialogue: 0,0:00:03.00,0:00:06.00,Default,,0,0,0,,This is amazing
```

### FFmpeg Subtitle Rendering

Styled subtitles are burned into the video using FFmpeg's ASS subtitle filter:

```bash
ffmpeg -i input.mp4 \
  -vf "ass=subtitles.ass" \
  -c:a copy \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  output.mp4
```

### Cache Management

Styled videos are cached in `data/cache/styled-subtitles/` to avoid re-processing. Cache files use UUID-based naming and include the style configuration.

## Performance Considerations

### Processing Time

Caption styling involves:
1. **SRT Parsing:** < 1 second
2. **ASS Generation:** < 1 second
3. **FFmpeg Rendering:** 30-60 seconds per minute of video

**Optimization Tips:**
- Use lower CRF values for faster encoding (trade-off with quality)
- Pre-generate styled versions for frequently used styles
- Consider batching multiple caption styling operations

### Video Quality

The Caption Styling Engine uses these FFmpeg settings:
- **Video Codec:** H.264 (libx264)
- **Preset:** Medium (balanced speed/quality)
- **CRF:** 23 (high quality)
- **Audio:** Copy (no re-encoding)

This maintains excellent quality while keeping file sizes reasonable.

## Troubleshooting

### Issue: Font not found
**Symptom:** Captions appear with default font instead of specified font
**Solution:** Ensure the font is installed in your system's font directory (`C:\Windows\Fonts` on Windows)

### Issue: Captions not visible
**Symptom:** Video plays but captions don't appear
**Solution:**
- Verify subtitle file has content and correct timing
- Check font color isn't same as video background
- Ensure position settings place text within video bounds

### Issue: Animation not working
**Symptom:** Captions appear instantly without animation
**Solution:**
- Check that ASS file was generated correctly
- Verify FFmpeg supports ASS subtitle format
- Try a different animation type

### Issue: Slow rendering
**Symptom:** FFmpeg takes too long to process video
**Solution:**
- Reduce video resolution before applying captions
- Use faster FFmpeg preset (e.g., "fast" instead of "medium")
- Consider hardware acceleration if available

## Best Practices

### 1. Caption Length
- Keep lines under 40 characters for readability
- Split long sentences across multiple subtitle entries
- Aim for 2-3 seconds minimum display time per caption

### 2. Color Contrast
- Ensure text color contrasts with video background
- Use stroke/shadow for better readability
- Test on both light and dark backgrounds

### 3. Animation Timing
- Match animation speed to speech pace
- Use faster animations (0.1s) for energetic content
- Use slower animations (0.3s) for dramatic effect

### 4. Position
- Center position works best for vertical videos
- Bottom position for traditional subtitle feel
- Avoid placing text over important visual elements

### 5. Style Selection
- **TikTok/Shorts:** Use "tiktok-trending" or "bold-impact"
- **Professional:** Use "minimal" or "classic"
- **Entertainment:** Use "karaoke" or "neon-glow"

## Future Enhancements

🔜 **Emoji Support** - Automatic emoji insertion based on sentiment
🔜 **Multiple Fonts** - Different fonts for different speakers
🔜 **Color Themes** - Pre-built color schemes for different moods
🔜 **Animation Presets** - More complex animation patterns
🔜 **Live Preview** - Real-time preview of style changes
🔜 **Batch Styling** - Apply same style to multiple videos at once

## Support

For issues or feature requests related to caption styling:
- Check logs in `apps/orchestrator/logs/`
- Verify FFmpeg is properly installed and accessible
- Test with a simple SRT file first to isolate issues

---

**Implementation Status:** ✅ Complete
**Version:** 1.0.0
**Date:** October 14, 2025
