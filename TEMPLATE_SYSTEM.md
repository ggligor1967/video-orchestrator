# Template System - Documentation

## Overview

The Template System provides pre-configured video templates that combine all settings (script, background, voice, captions, audio, export) into reusable configurations for one-click video creation. This dramatically reduces production time from 10+ minutes to under 30 seconds.

## Features

✅ **7 Pre-built Templates** - Horror, Mystery, True Crime, Paranormal, Facts, Motivational
✅ **Custom Templates** - Create and save your own template configurations
✅ **One-Click Video Creation** - Apply templates to generate complete videos instantly
✅ **Template Categories** - Organized by genre for easy discovery
✅ **Template Tags** - Filter templates by keywords
✅ **Import/Export** - Share templates as JSON files
✅ **Duplicate & Modify** - Clone templates and customize
✅ **Built-in Protection** - Built-in templates cannot be modified or deleted

## Quick Start

### 1. List Available Templates

```bash
curl http://127.0.0.1:4545/templates
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "horror-story-30s",
        "name": "Horror Story 30s",
        "description": "Short horror story with atmospheric background and dramatic captions",
        "category": "horror",
        "tags": ["horror", "story", "short", "tiktok"],
        "duration": 30,
        "isBuiltIn": true
      },
      ...
    ],
    "count": 7
  }
}
```

### 2. Apply Template (Create Video)

```bash
curl -X POST http://127.0.0.1:4545/templates/apply \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "horror-story-30s",
    "customizations": {
      "topic": "abandoned lighthouse at midnight"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templateId": "horror-story-30s",
    "jobId": "pipeline-abc123",
    "status": "processing",
    "outputPath": "D:\\data\\exports\\video-abc123.mp4"
  },
  "message": "Template applied successfully. Video creation in progress."
}
```

The video will be automatically created using all template settings!

## Pre-built Templates

### 1. Horror Story 30s
**ID:** `horror-story-30s`

Short horror story perfect for TikTok/Shorts.

- **Duration:** 30 seconds
- **Genre:** Horror
- **Background:** Dark forest/haunted atmosphere (auto-selected from stock)
- **Voice:** Male voice, slightly slower and lower pitch
- **Caption Style:** TikTok Trending (yellow boxes, word-by-word)
- **Export:** TikTok preset (8Mbps)
- **Required:** Topic

**Example:**
```json
{
  "templateId": "horror-story-30s",
  "customizations": {
    "topic": "cursed doll in attic"
  }
}
```

---

### 2. Horror Story 60s
**ID:** `horror-story-60s`

Medium-length horror story with cinematic feel.

- **Duration:** 60 seconds
- **Genre:** Horror
- **Background:** Abandoned building/creepy atmosphere
- **Voice:** Male voice, dramatic pitch
- **Caption Style:** Bold Impact with zoom animation
- **Video Effects:** Motion-based auto-reframe, progressive zoom
- **Export:** YouTube preset (12Mbps)
- **Required:** Topic

---

### 3. Mystery Investigation 60s
**ID:** `mystery-investigation-60s`

Investigative mystery story with noir aesthetic.

- **Duration:** 60 seconds
- **Genre:** Mystery
- **Background:** Detective/noir/investigation scenes
- **Voice:** Standard male voice, measured pace
- **Caption Style:** Minimal (clean, professional)
- **Export:** Instagram preset (8Mbps)
- **Required:** Topic

**Example:**
```json
{
  "templateId": "mystery-investigation-60s",
  "customizations": {
    "topic": "missing person case from 1995"
  }
}
```

---

### 4. True Crime 45s
**ID:** `true-crime-45s`

True crime story with documentary-style presentation.

- **Duration:** 45 seconds
- **Genre:** True Crime
- **Background:** Police/crime scene/investigation
- **Voice:** Male voice, slightly faster pace
- **Caption Style:** Classic (documentary-style subtitles)
- **Video Effects:** Face-detection auto-reframe
- **Export:** TikTok preset
- **Required:** Topic

---

### 5. Paranormal Encounter 30s
**ID:** `paranormal-30s`

Supernatural story with eerie atmosphere.

- **Duration:** 30 seconds
- **Genre:** Paranormal
- **Background:** Ghost/supernatural/eerie mist
- **Voice:** Female voice, slower and slightly lower pitch
- **Caption Style:** Neon Glow (cyberpunk aesthetic)
- **Export:** TikTok preset
- **Required:** Topic

**Example:**
```json
{
  "templateId": "paranormal-30s",
  "customizations": {
    "topic": "ghost sighting in old hospital"
  }
}
```

---

### 6. Quick Facts 15s
**ID:** `quick-facts-15s`

Fast-paced fact presentation for viral content.

- **Duration:** 15 seconds
- **Genre:** Mystery
- **Style:** Facts (not story)
- **Background:** Abstract/colorful/dynamic
- **Voice:** Standard voice, 1.2x speed, higher pitch
- **Caption Style:** Karaoke (word highlighting)
- **Video Effects:** Progressive zoom from 1 second
- **Audio:** Louder normalization (-14 LUFS for energy)
- **Export:** TikTok preset
- **Required:** Topic

**Example:**
```json
{
  "templateId": "quick-facts-15s",
  "customizations": {
    "topic": "ancient Egypt pyramids"
  }
}
```

---

### 7. Motivational Quote 20s
**ID:** `motivational-quote-20s`

Inspirational quote with uplifting visuals.

- **Duration:** 20 seconds
- **Genre:** Motivational
- **Style:** Quote
- **Background:** Sunrise/mountains/inspiring nature
- **Voice:** Female voice, slightly higher pitch
- **Caption Style:** Bold Impact
- **Export:** Instagram preset
- **Required:** Topic

**Example:**
```json
{
  "templateId": "motivational-quote-20s",
  "customizations": {
    "topic": "never give up on your dreams"
  }
}
```

## API Endpoints

### Get All Templates
**Endpoint:** `GET /templates`

Get all templates with optional filters.

**Query Parameters:**
- `category` (optional) - Filter by category (horror, mystery, etc.)
- `tags` (optional) - Comma-separated tags to filter by
- `search` (optional) - Search in name, description, tags

**Examples:**
```bash
# Get all templates
curl http://127.0.0.1:4545/templates

# Filter by category
curl "http://127.0.0.1:4545/templates?category=horror"

# Filter by tags
curl "http://127.0.0.1:4545/templates?tags=short,tiktok"

# Search
curl "http://127.0.0.1:4545/templates?search=crime"
```

---

### Get Template Details
**Endpoint:** `GET /templates/:templateId`

Get complete configuration for a specific template.

**Example:**
```bash
curl http://127.0.0.1:4545/templates/horror-story-30s
```

**Response:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "horror-story-30s",
      "name": "Horror Story 30s",
      "description": "...",
      "category": "horror",
      "tags": ["horror", "story", "short", "tiktok"],
      "duration": 30,
      "isBuiltIn": true,
      "scriptSettings": {
        "genre": "horror",
        "style": "story",
        "duration": 30,
        "topic": null
      },
      "backgroundSettings": {
        "type": "stock",
        "stockQuery": "dark forest night haunted",
        "orientation": "portrait",
        "autoSelect": true
      },
      "voiceSettings": {
        "voice": "en_US-hfc_male-medium",
        "speed": 0.95,
        "pitch": 0.9
      },
      "captionStyle": "tiktok-trending",
      "audioSettings": { ... },
      "videoSettings": { ... },
      "exportPreset": "tiktok"
    }
  }
}
```

---

### Apply Template
**Endpoint:** `POST /templates/apply`

Create a video from a template with customizations.

**Request Body:**
```json
{
  "templateId": "horror-story-30s",
  "customizations": {
    "topic": "haunted mansion",          // Required for most templates
    "genre": "paranormal",                // Optional: override genre
    "duration": 40,                       // Optional: override duration
    "backgroundPath": "D:\\path.mp4",    // Optional: use custom background
    "voice": "en_US-hfc_female-medium",  // Optional: override voice
    "speed": 1.0,                         // Optional: override speed
    "captionStyle": "minimal",            // Optional: override caption style
    "exportPreset": "youtube"             // Optional: override export preset
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templateId": "horror-story-30s",
    "jobId": "pipeline-abc123",
    "status": "processing",
    "outputPath": "D:\\data\\exports\\video-abc123.mp4"
  },
  "message": "Template applied successfully. Video creation in progress."
}
```

**Check Status:**
```bash
curl http://127.0.0.1:4545/pipeline/status/pipeline-abc123
```

---

### Get Categories
**Endpoint:** `GET /templates/categories`

Get all template categories with counts.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      { "id": "horror", "name": "Horror", "count": 2 },
      { "id": "mystery", "name": "Mystery", "count": 1 },
      { "id": "true-crime", "name": "True Crime", "count": 1 },
      { "id": "paranormal", "name": "Paranormal", "count": 1 },
      { "id": "educational", "name": "Educational", "count": 1 },
      { "id": "motivational", "name": "Motivational", "count": 1 }
    ],
    "count": 6
  }
}
```

---

### Get Tags
**Endpoint:** `GET /templates/tags`

Get all template tags with counts.

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": [
      { "id": "horror", "name": "Horror", "count": 3 },
      { "id": "story", "name": "Story", "count": 5 },
      { "id": "short", "name": "Short", "count": 3 },
      { "id": "tiktok", "name": "Tiktok", "count": 4 },
      ...
    ],
    "count": 15
  }
}
```

---

### Create Custom Template
**Endpoint:** `POST /templates`

Create your own custom template.

**Request Body:**
```json
{
  "name": "My Horror Template",
  "description": "Custom horror template with specific settings",
  "category": "horror",
  "tags": ["horror", "custom", "intense"],
  "duration": 45,

  "scriptSettings": {
    "genre": "horror",
    "style": "story",
    "duration": 45,
    "topic": null
  },

  "backgroundSettings": {
    "type": "stock",
    "stockQuery": "creepy basement dark shadows",
    "orientation": "portrait",
    "autoSelect": true
  },

  "voiceSettings": {
    "voice": "en_US-hfc_male-medium",
    "speed": 0.9,
    "pitch": 0.85
  },

  "captionStyle": "bold-impact",

  "audioSettings": {
    "backgroundMusic": null,
    "volume": 0.3,
    "normalize": true,
    "lufs": -16
  },

  "videoSettings": {
    "autoReframe": true,
    "detectionMode": "center",
    "speedRamp": true,
    "speedRampStart": 3
  },

  "exportPreset": "tiktok"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "custom-abc123",
      "name": "My Horror Template",
      "isBuiltIn": false,
      "createdAt": "2025-10-14T17:30:00.000Z",
      ...
    }
  },
  "message": "Template created successfully"
}
```

---

### Update Custom Template
**Endpoint:** `PUT /templates/:templateId`

Update a custom template (built-in templates cannot be updated).

**Request Body:** Partial template object with fields to update

```json
{
  "name": "My Updated Template Name",
  "duration": 50,
  "captionStyle": "minimal"
}
```

---

### Delete Custom Template
**Endpoint:** `DELETE /templates/:templateId`

Delete a custom template (built-in templates cannot be deleted).

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

### Duplicate Template
**Endpoint:** `POST /templates/:templateId/duplicate`

Create a copy of any template (including built-in ones).

**Request Body:**
```json
{
  "newName": "My Custom Horror Template"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "custom-xyz789",
      "name": "My Custom Horror Template",
      "isBuiltIn": false,
      ...
    }
  },
  "message": "Template duplicated successfully"
}
```

**Use Case:** Duplicate a built-in template, then modify it to create your own variation.

---

### Export Template
**Endpoint:** `GET /templates/:templateId/export`

Export template as downloadable JSON file.

**Example:**
```bash
curl http://127.0.0.1:4545/templates/horror-story-30s/export -o my-template.json
```

**Response:** JSON file download

---

### Import Template
**Endpoint:** `POST /templates/import`

Import a template from JSON.

**Request Body:**
```json
{
  "templateJson": "{\"name\":\"Imported Template\",\"description\":\"...\", ...}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "custom-imported-123",
      ...
    }
  },
  "message": "Template imported successfully"
}
```

## Template Configuration

### Script Settings
```json
{
  "genre": "horror",           // horror, mystery, paranormal, true crime, motivational
  "style": "story",            // story, facts, quote
  "duration": 30,              // Video duration in seconds
  "topic": null                // null = user must provide topic
}
```

### Background Settings
```json
{
  "type": "stock",                           // stock or upload
  "stockQuery": "dark forest night",         // Search query for stock media
  "orientation": "portrait",                 // portrait, landscape, square
  "autoSelect": true                         // Automatically pick best match
}
```

If user provides `backgroundPath` in customizations, it overrides stock selection.

### Voice Settings
```json
{
  "voice": "en_US-hfc_male-medium",          // Voice ID
  "speed": 0.95,                             // 0.5 - 2.0
  "pitch": 0.9                               // 0.5 - 2.0 (lower = deeper)
}
```

### Caption Style
```json
"captionStyle": "tiktok-trending"            // Any caption preset ID
```

Available styles: `tiktok-trending`, `minimal`, `karaoke`, `neon-glow`, `classic`, `bold-impact`

### Audio Settings
```json
{
  "backgroundMusic": null,                   // Path to music file (optional)
  "volume": 0.3,                             // 0.0 - 1.0
  "normalize": true,                         // Enable loudness normalization
  "lufs": -16                                // Target LUFS level
}
```

### Video Settings
```json
{
  "autoReframe": true,                       // Enable auto-reframing
  "detectionMode": "center",                 // face, motion, center
  "speedRamp": false,                        // Enable progressive zoom
  "speedRampStart": 2                        // Start zoom after X seconds
}
```

### Export Preset
```json
"exportPreset": "tiktok"                     // tiktok, youtube, instagram
```

## Complete Workflow Example

```javascript
// 1. List templates to find the right one
const templatesRes = await fetch('http://127.0.0.1:4545/templates?category=horror');
const { templates } = await templatesRes.json();

// 2. Get template details
const templateRes = await fetch('http://127.0.0.1:4545/templates/horror-story-30s');
const { template } = await templateRes.json();

// 3. Apply template to create video
const applyRes = await fetch('http://127.0.0.1:4545/templates/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'horror-story-30s',
    customizations: {
      topic: 'abandoned asylum patient records'
    }
  })
});

const { jobId, outputPath } = await applyRes.json();

// 4. Check pipeline status
const statusRes = await fetch(`http://127.0.0.1:4545/pipeline/status/${jobId}`);
const { status, progress } = await statusRes.json();

// 5. When complete, video is ready at outputPath
console.log('Video created:', outputPath);
```

## Best Practices

### 1. Template Selection
- **TikTok/Shorts:** Use 15-30s templates
- **YouTube Shorts:** Use 45-60s templates
- **Instagram Reels:** Use 30-45s templates

### 2. Topic Guidelines
- Be specific: "abandoned lighthouse at midnight" > "lighthouse"
- Include atmosphere: "creepy basement with flickering lights"
- Avoid too many details: Script AI works best with focused topics

### 3. Customization Strategy
- **Minimal customization:** Just provide topic - let template handle everything
- **Voice override:** Change voice if target audience prefers different gender/style
- **Background override:** Use custom background if you have specific footage
- **Export override:** Change preset based on target platform

### 4. Custom Template Creation
- Start by duplicating a similar built-in template
- Test thoroughly before using in production
- Save successful configurations as templates for reuse

### 5. Template Organization
- Use descriptive names: "Horror 30s - Intense Voice"
- Use tags generously for easy filtering
- Keep templates organized by use case

## Advanced Features

### Batch Template Application
Apply same template to multiple topics:

```javascript
const topics = [
  'haunted mansion on the hill',
  'cursed cemetery at midnight',
  'abandoned hospital room 13'
];

const jobs = await Promise.all(
  topics.map(topic =>
    fetch('http://127.0.0.1:4545/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 'horror-story-30s',
        customizations: { topic }
      })
    }).then(r => r.json())
  )
);

console.log('Created', jobs.length, 'videos');
```

### Template Marketplace (Future)
Export and share templates with others:

```bash
# Export your template
curl http://127.0.0.1:4545/templates/custom-abc123/export -o my-awesome-template.json

# Share the JSON file
# Others can import it
curl -X POST http://127.0.0.1:4545/templates/import \
  -H "Content-Type: application/json" \
  -d '{"templateJson": "..."}'
```

## Performance

### Template Application Speed
- **Script Generation:** 2-5 seconds (using AI)
- **Stock Media Selection:** 3-5 seconds
- **TTS Generation:** 5-10 seconds
- **Video Processing:** 20-40 seconds
- **Total:** 30-60 seconds for complete video

Compare to manual process: 10+ minutes

### Optimization Tips
1. **Use cached backgrounds** - Upload frequently used backgrounds instead of stock
2. **Pre-generate TTS** - Generate voice-overs ahead of time
3. **Batch processing** - Use `/batch` endpoint for multiple videos
4. **Template reuse** - Save working configurations as templates

## Troubleshooting

### Issue: "Topic is required for this template"
**Solution:** Template's scriptSettings.topic is null, meaning you must provide a topic in customizations.

### Issue: Template not found
**Solution:**
- Check template ID is correct
- Custom templates may have been deleted
- Built-in templates always exist

### Issue: Cannot update/delete built-in template
**Solution:** Built-in templates are protected. Duplicate the template first, then modify the copy.

### Issue: Stock video not found for query
**Solution:**
- Provide more generic search query
- Or provide custom backgroundPath in customizations
- Check stock media API keys are configured

### Issue: Pipeline job fails
**Solution:**
- Check pipeline job status for error details: `GET /pipeline/status/:jobId`
- Verify all required services are running
- Check logs for specific errors

## Future Enhancements

🔜 **Template Preview** - Generate preview thumbnails for templates
🔜 **Template Ratings** - Community ratings and reviews
🔜 **Template Marketplace** - Share and download templates
🔜 **Template Analytics** - Track which templates are most successful
🔜 **A/B Testing** - Test multiple templates for same topic
🔜 **Schedule Templates** - Schedule template application for later
🔜 **Template Variations** - Automatically create variations of successful videos

## Support

For issues related to templates:
- Check template configuration is valid
- Verify all required customizations are provided
- Test with built-in templates first
- Check pipeline logs for detailed errors

---

**Implementation Status:** ✅ Complete
**Version:** 1.0.0
**Date:** October 14, 2025
**Templates:** 7 built-in, unlimited custom
