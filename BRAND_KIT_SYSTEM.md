# Brand Kit System - Complete Documentation

## Overview

The **Brand Kit System** provides comprehensive visual identity management for your video content. It enables you to create, manage, and apply consistent branding across all your videos with custom colors, fonts, logos, intros, outros, watermarks, and default settings.

When integrated with the Template System, brand kits automatically apply your visual identity to template-generated videos, ensuring brand consistency across all your content.

## Features

### Core Capabilities
- **Visual Identity Management**: Colors, fonts, logos, watermarks
- **Video Branding**: Intro/outro videos, logo overlays, watermarks
- **Default Settings**: Voice, caption style, export preset, music volume
- **Music Library**: Per-brand music collection with random selection
- **File Upload Support**: Upload logos, intro/outro videos, music tracks
- **FFmpeg Integration**: Seamless video processing and overlay
- **Template Integration**: Auto-apply brand kit to template videos
- **CRUD Operations**: Create, read, update, delete brand kits
- **Graceful Fallback**: Continues video creation even if branding fails

### Integration with Template System
When you apply a template with a brand kit ID, the system automatically:
1. Uses brand kit's default voice (unless overridden)
2. Applies brand kit's default caption style
3. Uses brand kit's default export preset
4. Selects random music from brand kit's library
5. Post-processes video with intro + logo + watermark + outro

## API Endpoints

### Base URL
All brand kit endpoints are under `/brands`

### 1. Create Brand Kit
```http
POST /brands
Content-Type: application/json

{
  "name": "My Horror Channel",
  "colors": {
    "primary": "#FF0000",
    "secondary": "#000000",
    "accent": "#FFFFFF",
    "background": "#1A1A1A",
    "text": "#FFFFFF"
  },
  "fonts": {
    "primary": "Montserrat-Bold",
    "secondary": "Arial",
    "sizes": {
      "heading": 90,
      "body": 70,
      "caption": 50
    }
  },
  "logo": {
    "path": "/data/brands/my-brand/logo.png",
    "position": "top-right",
    "size": "small",
    "opacity": 0.8
  },
  "watermark": {
    "enabled": true,
    "type": "text",
    "text": "@MyHorrorChannel",
    "position": "bottom-right",
    "fontSize": 40,
    "color": "#FFFFFF",
    "opacity": 0.7
  },
  "intro": {
    "enabled": true,
    "duration": 3,
    "videoPath": "/data/brands/my-brand/intro.mp4"
  },
  "outro": {
    "enabled": true,
    "duration": 5,
    "videoPath": "/data/brands/my-brand/outro.mp4",
    "callToAction": "Follow for more horror stories!"
  },
  "defaults": {
    "voice": "en_US-hfc_male-medium",
    "captionStyle": "tiktok-trending",
    "exportPreset": "tiktok",
    "musicVolume": 0.25
  },
  "musicLibrary": [
    "/data/brands/my-brand/music/dark-ambient.mp3",
    "/data/brands/my-brand/music/suspense.mp3"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "brandKit": {
      "id": "brand-abc123",
      "name": "My Horror Channel",
      "colors": { ... },
      "fonts": { ... },
      "logo": { ... },
      "watermark": { ... },
      "intro": { ... },
      "outro": { ... },
      "defaults": { ... },
      "musicLibrary": [ ... ],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  },
  "message": "Brand kit created successfully"
}
```

### 2. Get All Brand Kits
```http
GET /brands
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "brandKits": [
      {
        "id": "brand-abc123",
        "name": "My Horror Channel",
        "colors": { ... },
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

### 3. Get Brand Kit by ID
```http
GET /brands/:brandKitId
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "brandKit": {
      "id": "brand-abc123",
      "name": "My Horror Channel",
      "colors": { ... },
      "fonts": { ... },
      "logo": { ... },
      "watermark": { ... },
      "intro": { ... },
      "outro": { ... },
      "defaults": { ... },
      "musicLibrary": [ ... ],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

### 4. Update Brand Kit
```http
PUT /brands/:brandKitId
Content-Type: application/json

{
  "name": "My Horror Channel - Updated",
  "colors": {
    "primary": "#CC0000"
  },
  "defaults": {
    "musicVolume": 0.3
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "brandKit": {
      "id": "brand-abc123",
      "name": "My Horror Channel - Updated",
      "colors": {
        "primary": "#CC0000",
        "secondary": "#000000",
        "accent": "#FFFFFF",
        "background": "#1A1A1A",
        "text": "#FFFFFF"
      },
      "defaults": {
        "voice": "en_US-hfc_male-medium",
        "captionStyle": "tiktok-trending",
        "exportPreset": "tiktok",
        "musicVolume": 0.3
      },
      "updatedAt": "2025-01-15T11:00:00Z"
    }
  },
  "message": "Brand kit updated successfully"
}
```

### 5. Delete Brand Kit
```http
DELETE /brands/:brandKitId
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Brand kit deleted successfully"
}
```

### 6. Apply Brand Kit to Video
```http
POST /brands/:brandKitId/apply
Content-Type: application/json

{
  "videoPath": "/data/exports/video-123.mp4",
  "skipIntro": false,
  "skipOutro": false,
  "skipLogo": false,
  "skipWatermark": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "brandKitId": "brand-abc123",
    "originalPath": "/data/exports/video-123.mp4",
    "outputPath": "/data/exports/video-123-branded.mp4",
    "appliedElements": ["intro", "logo", "watermark", "outro"],
    "processingTime": 12.5
  },
  "message": "Brand kit applied successfully"
}
```

### 7. Upload Logo
```http
POST /brands/:brandKitId/logo/upload
Content-Type: multipart/form-data

file: logo.png
position: top-right (optional)
size: small (optional: small|medium|large)
opacity: 0.8 (optional: 0-1)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filePath": "/data/brands/brand-abc123/logo.png",
    "logo": {
      "path": "/data/brands/brand-abc123/logo.png",
      "position": "top-right",
      "size": "small",
      "opacity": 0.8
    }
  },
  "message": "Logo uploaded successfully"
}
```

### 8. Upload Intro Video
```http
POST /brands/:brandKitId/intro/upload
Content-Type: multipart/form-data

file: intro.mp4
duration: 3 (optional: seconds)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filePath": "/data/brands/brand-abc123/intro.mp4",
    "intro": {
      "enabled": true,
      "duration": 3,
      "videoPath": "/data/brands/brand-abc123/intro.mp4"
    }
  },
  "message": "Intro video uploaded successfully"
}
```

### 9. Upload Outro Video
```http
POST /brands/:brandKitId/outro/upload
Content-Type: multipart/form-data

file: outro.mp4
duration: 5 (optional: seconds)
callToAction: "Follow for more!" (optional)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filePath": "/data/brands/brand-abc123/outro.mp4",
    "outro": {
      "enabled": true,
      "duration": 5,
      "videoPath": "/data/brands/brand-abc123/outro.mp4",
      "callToAction": "Follow for more!"
    }
  },
  "message": "Outro video uploaded successfully"
}
```

### 10. Upload Music Track
```http
POST /brands/:brandKitId/music/upload
Content-Type: multipart/form-data

file: dark-ambient.mp3
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filePath": "/data/brands/brand-abc123/music/dark-ambient.mp3",
    "musicLibrary": [
      "/data/brands/brand-abc123/music/dark-ambient.mp3",
      "/data/brands/brand-abc123/music/suspense.mp3"
    ]
  },
  "message": "Music track uploaded successfully"
}
```

## Brand Kit Structure

### Complete Schema
```typescript
interface BrandKit {
  id: string;
  name: string;

  // Visual identity
  colors?: {
    primary?: string;      // Hex color (#RRGGBB)
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };

  fonts?: {
    primary?: string;      // Font family name
    secondary?: string;
    sizes?: {
      heading?: number;    // 20-150
      body?: number;
      caption?: number;
    };
  };

  // Logo overlay
  logo?: {
    path: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size?: 'small' | 'medium' | 'large';
    opacity?: number;      // 0-1
  };

  // Watermark
  watermark?: {
    enabled: boolean;
    type: 'text' | 'image';
    text?: string;         // If type is 'text'
    imagePath?: string;    // If type is 'image'
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    fontSize?: number;     // 20-100 (for text watermarks)
    color?: string;        // Hex color (for text watermarks)
    opacity?: number;      // 0-1
  };

  // Intro video
  intro?: {
    enabled: boolean;
    duration: number;      // Seconds
    videoPath?: string;
  };

  // Outro video
  outro?: {
    enabled: boolean;
    duration: number;      // Seconds
    videoPath?: string;
    callToAction?: string;
  };

  // Default settings for video creation
  defaults?: {
    voice?: string;
    captionStyle?: string;
    exportPreset?: 'tiktok' | 'youtube' | 'instagram';
    musicVolume?: number;  // 0-1
  };

  // Music library
  musicLibrary?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### Validation Rules

**Colors**:
- Must be valid hex color format: `#RRGGBB`
- Example: `#FF0000`, `#1A1A1A`

**Fonts**:
- Font family names must be strings
- Font sizes: 20-150 pixels

**Logo**:
- Positions: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center`
- Sizes: `small` (150px), `medium` (200px), `large` (250px)
- Opacity: 0-1 (0 = transparent, 1 = opaque)

**Watermark**:
- Type: `text` or `image`
- If text: requires `text` property
- If image: requires `imagePath` property
- Font size: 20-100 pixels
- Opacity: 0-1

**Intro/Outro**:
- Duration: positive number (seconds)
- Video path must exist if enabled

**Defaults**:
- Music volume: 0-1 (0 = silent, 1 = full volume)

## Integration with Templates

### Using Brand Kit with Template
```javascript
// Apply template WITH brand kit
POST /templates/apply
{
  "templateId": "horror-story-30s",
  "customizations": {
    "topic": "haunted lighthouse",
    "brandKitId": "brand-abc123"  // Brand kit auto-applies!
  }
}
```

### What Happens Behind the Scenes

1. **Template loads** with base settings
2. **Brand kit defaults applied**:
   - Voice: Uses `brandKit.defaults.voice` (unless overridden in customizations)
   - Caption Style: Uses `brandKit.defaults.captionStyle`
   - Export Preset: Uses `brandKit.defaults.exportPreset`
   - Music Volume: Uses `brandKit.defaults.musicVolume`

3. **Music selection**:
   - Randomly selects track from `brandKit.musicLibrary`
   - If library is empty, uses template's default music

4. **Pipeline executes** and creates base video

5. **Brand kit post-processing**:
   - Adds intro video (if enabled)
   - Overlays logo (if configured)
   - Adds watermark (if enabled)
   - Adds outro video (if enabled)

6. **Result**: Fully branded video ready for export

### Priority Order

Settings are applied in this priority (highest to lowest):

1. **Customizations** (user-provided overrides)
2. **Brand Kit Defaults** (from brand kit configuration)
3. **Template Defaults** (from template definition)

**Example**:
```javascript
// Template default voice: 'en_US-hfc_male-medium'
// Brand kit default voice: 'en_US-amy-medium'
// Customization voice: 'en_GB-alan-medium'

// Result: Uses 'en_GB-alan-medium' (customization wins)
```

```javascript
// Template default voice: 'en_US-hfc_male-medium'
// Brand kit default voice: 'en_US-amy-medium'
// No customization voice provided

// Result: Uses 'en_US-amy-medium' (brand kit wins)
```

```javascript
// Template default voice: 'en_US-hfc_male-medium'
// No brand kit
// No customization

// Result: Uses 'en_US-hfc_male-medium' (template default)
```

## FFmpeg Integration

### Logo Overlay
The system uses FFmpeg complex filters to overlay logos:

```bash
ffmpeg -i video.mp4 -i logo.png \
  -filter_complex "[1:v]scale=150:-1[logo];[0:v][logo]overlay=x:y:format=auto,format=yuv420p" \
  -c:a copy output.mp4
```

**Position Calculation**:
- `top-left`: x=20, y=20
- `top-right`: x=(W-logo_width-20), y=20
- `bottom-left`: x=20, y=(H-logo_height-20)
- `bottom-right`: x=(W-logo_width-20), y=(H-logo_height-20)
- `center`: x=(W-logo_width)/2, y=(H-logo_height)/2

### Text Watermark
Uses FFmpeg drawtext filter:

```bash
ffmpeg -i video.mp4 \
  -vf "drawtext=text='@MyChannel':fontsize=40:fontcolor=white@0.7:x=20:y=H-th-20" \
  -c:a copy output.mp4
```

### Video Concatenation (Intro/Outro)
Uses FFmpeg concat filter:

```bash
ffmpeg -i intro.mp4 -i main.mp4 -i outro.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]" \
  -map "[outv]" -map "[outa]" output.mp4
```

## File Upload Handling

### Supported File Types

**Logo**:
- Formats: PNG, JPG, JPEG, WEBP
- Max size: 50MB
- Recommended: PNG with transparency
- Recommended dimensions: 300x300px (will be scaled)

**Intro/Outro Videos**:
- Formats: MP4, MOV, AVI, WEBM
- Max size: 50MB
- Recommended: 1080x1920 (9:16 vertical), 30fps
- Duration: 3-10 seconds

**Music Tracks**:
- Formats: MP3, WAV, OGG, M4A
- Max size: 50MB
- Recommended: MP3, 192kbps, stereo

### Upload Process

1. **Client uploads file** via multipart/form-data
2. **Multer receives** file in memory
3. **File is saved** to `/data/brands/{brandKitId}/{type}/`
4. **Brand kit updated** with file path
5. **Path returned** to client

### Storage Structure
```
data/
└── brands/
    └── brand-abc123/
        ├── logo.png
        ├── intro.mp4
        ├── outro.mp4
        └── music/
            ├── track1.mp3
            ├── track2.mp3
            └── track3.mp3
```

## Error Handling

### Common Errors

**404 - Brand Kit Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Brand kit not found"
  }
}
```

**400 - Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "issues": [
      {
        "field": "colors.primary",
        "message": "Invalid hex color format"
      }
    ]
  }
}
```

**400 - File Upload Error**:
```json
{
  "success": false,
  "error": {
    "code": "FILE_UPLOAD_ERROR",
    "message": "No file uploaded"
  }
}
```

**500 - FFmpeg Error**:
```json
{
  "success": false,
  "error": {
    "code": "FFMPEG_ERROR",
    "message": "Failed to apply logo overlay"
  }
}
```

### Graceful Fallback

If brand kit application fails during template video creation, the system will:

1. **Log the error** with full details
2. **Continue with original video** (without branding)
3. **Return success** with original output path
4. **Notify user** via warning in response

This ensures video creation doesn't fail completely due to branding issues.

## Best Practices

### 1. Organize Your Assets
- Keep all brand assets in dedicated folders
- Use consistent naming conventions
- Store multiple versions (light/dark, seasonal)

### 2. Optimize File Sizes
- Compress logos to < 500KB
- Keep intro/outro videos under 30 seconds
- Use 192kbps MP3 for music tracks

### 3. Test Your Branding
- Apply brand kit to test video first
- Check logo/watermark visibility on different backgrounds
- Verify intro/outro transitions are smooth

### 4. Use Brand Kit Defaults
- Set defaults for consistent voice across videos
- Configure default caption style matching your brand
- Set appropriate music volume (0.2-0.3 recommended)

### 5. Music Library Management
- Include 5-10 tracks minimum per brand
- Use royalty-free music only
- Tag tracks by mood/genre for better selection

### 6. Version Control
- Create multiple brand kits for A/B testing
- Keep backup copies of original assets
- Document changes in brand kit name/description

## Usage Examples

### Example 1: Create Complete Brand Kit
```javascript
const brandKit = {
  name: "Horror Stories Daily",
  colors: {
    primary: "#8B0000",
    secondary: "#1A1A1A",
    accent: "#FF4500",
    background: "#000000",
    text: "#FFFFFF"
  },
  fonts: {
    primary: "Creepster",
    secondary: "Roboto",
    sizes: {
      heading: 90,
      body: 70,
      caption: 50
    }
  },
  logo: {
    path: "/data/brands/horror-daily/logo.png",
    position: "top-right",
    size: "small",
    opacity: 0.9
  },
  watermark: {
    enabled: true,
    type: "text",
    text: "@HorrorStoriesDaily",
    position: "bottom-right",
    fontSize: 45,
    color: "#FFFFFF",
    opacity: 0.8
  },
  intro: {
    enabled: true,
    duration: 3,
    videoPath: "/data/brands/horror-daily/intro.mp4"
  },
  outro: {
    enabled: true,
    duration: 5,
    videoPath: "/data/brands/horror-daily/outro.mp4",
    callToAction: "Follow for daily horror stories!"
  },
  defaults: {
    voice: "en_US-hfc_male-medium",
    captionStyle: "horror-glow",
    exportPreset: "tiktok",
    musicVolume: 0.25
  },
  musicLibrary: [
    "/data/brands/horror-daily/music/dark-ambient-1.mp3",
    "/data/brands/horror-daily/music/dark-ambient-2.mp3",
    "/data/brands/horror-daily/music/suspense-1.mp3"
  ]
};

const response = await fetch('http://127.0.0.1:4545/brands', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(brandKit)
});

const result = await response.json();
console.log('Brand Kit ID:', result.data.brandKit.id);
```

### Example 2: Upload Logo
```javascript
const formData = new FormData();
formData.append('file', logoFile);
formData.append('position', 'top-right');
formData.append('size', 'small');
formData.append('opacity', '0.9');

const response = await fetch(
  `http://127.0.0.1:4545/brands/${brandKitId}/logo/upload`,
  {
    method: 'POST',
    body: formData
  }
);

const result = await response.json();
console.log('Logo uploaded:', result.data.filePath);
```

### Example 3: Apply Brand Kit to Template
```javascript
const response = await fetch('http://127.0.0.1:4545/templates/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'horror-story-30s',
    customizations: {
      topic: 'abandoned hospital',
      brandKitId: 'brand-horror-daily'  // Auto-applies branding!
    }
  })
});

const result = await response.json();
console.log('Video job ID:', result.data.jobId);
// Video will have intro + branded content + outro
```

### Example 4: Update Brand Kit Colors
```javascript
const response = await fetch(
  `http://127.0.0.1:4545/brands/${brandKitId}`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      colors: {
        primary: "#A00000",  // Slightly lighter red
        accent: "#FF6347"    // Tomato red
      }
    })
  }
);

const result = await response.json();
console.log('Brand kit updated:', result.data.brandKit);
```

### Example 5: Apply Brand Kit to Existing Video
```javascript
const response = await fetch(
  `http://127.0.0.1:4545/brands/${brandKitId}/apply`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoPath: '/data/exports/my-video.mp4',
      skipIntro: false,
      skipOutro: false,
      skipLogo: false,
      skipWatermark: false
    })
  }
);

const result = await response.json();
console.log('Branded video:', result.data.outputPath);
```

## Troubleshooting

### Logo Not Visible
**Problem**: Logo overlay not showing on video

**Solutions**:
- Check logo file exists at specified path
- Verify logo opacity is > 0
- Ensure logo position is valid
- Try larger logo size (medium or large)
- Check video resolution matches expectations

### Intro/Outro Not Added
**Problem**: Intro or outro video not appearing

**Solutions**:
- Verify `intro.enabled` / `outro.enabled` is `true`
- Check video file exists at specified path
- Ensure video format is MP4 (other formats may not concatenate properly)
- Verify video has both video and audio streams
- Check FFmpeg logs for concatenation errors

### Music Not Playing
**Problem**: Background music from brand kit not audible

**Solutions**:
- Check `musicLibrary` array is not empty
- Verify music files exist at specified paths
- Increase `defaults.musicVolume` (try 0.3-0.5)
- Ensure music format is MP3 or WAV
- Check audio normalization isn't reducing volume too much

### File Upload Fails
**Problem**: File upload returns error

**Solutions**:
- Check file size is under 50MB
- Verify file format is supported
- Ensure brand kit exists before uploading
- Check disk space is available
- Try different file (may be corrupted)

### Watermark Position Wrong
**Problem**: Text watermark appears in wrong location

**Solutions**:
- Verify `watermark.position` is valid
- Check font size isn't too large
- Ensure opacity > 0
- Try different position to test
- Check video resolution (watermark position is calculated based on video dimensions)

## Technical Implementation

### Service Layer (`brandKitService.js`)

**Key Methods**:
- `createBrandKit(data)` - Creates new brand kit with validation
- `getAllBrandKits()` - Returns all brand kits
- `getBrandKitById(id)` - Returns specific brand kit
- `updateBrandKit(id, updates)` - Updates brand kit
- `deleteBrandKit(id)` - Deletes brand kit
- `applyBrandKit(id, videoPath, options)` - Applies branding to video
- `addIntro(videoPath, introConfig, outputPath)` - Adds intro via FFmpeg
- `addOutro(videoPath, outroConfig, outputPath)` - Adds outro via FFmpeg
- `addLogoOverlay(videoPath, logoConfig, outputPath)` - Overlays logo via FFmpeg
- `addWatermark(videoPath, watermarkConfig, outputPath)` - Adds watermark via FFmpeg
- `getRandomMusic(brandKit)` - Selects random track from library
- `uploadFile(brandKitId, file, type)` - Handles file uploads
- `calculateLogoPosition(logoConfig)` - Calculates overlay coordinates

### Controller Layer (`brandKitController.js`)

**Validation Schemas**:
- `createBrandKitSchema` - Validates brand kit creation
- `updateBrandKitSchema` - Validates updates (all fields optional)
- `applyBrandKitSchema` - Validates apply request
- `uploadLogoSchema` - Validates logo upload parameters
- `uploadIntroSchema` - Validates intro upload parameters
- `uploadOutroSchema` - Validates outro upload parameters

**Error Handling**:
- Zod validation errors → 400 with formatted error
- Not found errors → 404 with code
- File upload errors → 400 with specific message
- FFmpeg errors → 500 with error details
- All other errors → passed to error handler middleware

### Routes Layer (`brands.js`)

**Multer Configuration**:
- Storage: Memory storage
- File size limit: 50MB
- Single file upload per request

**Endpoints**:
- CRUD operations: GET, POST, PUT, DELETE
- File uploads: POST with multipart/form-data
- Apply branding: POST with JSON body

## Performance Considerations

### Video Processing Time
- **Logo overlay**: ~2-5 seconds (1080x1920 video)
- **Watermark**: ~2-5 seconds
- **Intro concatenation**: ~3-8 seconds
- **Outro concatenation**: ~5-10 seconds
- **Full branding** (all elements): ~15-30 seconds total

### Optimization Tips
1. **Process in order**: Intro → Logo → Watermark → Outro (minimizes intermediate files)
2. **Skip unnecessary steps**: Use `skip*` flags to skip disabled elements
3. **Use hardware acceleration**: Configure FFmpeg with GPU encoding if available
4. **Optimize intro/outro**: Keep under 5 seconds, use efficient codecs
5. **Cache processed videos**: Store branded versions to avoid re-processing

## Future Enhancements

Potential improvements for future versions:

1. **Animated logos** - Support for animated PNG/GIF overlays
2. **Dynamic watermarks** - Change watermark based on video content
3. **Theme support** - Multiple color themes per brand kit
4. **Smart positioning** - AI-based logo positioning avoiding important content
5. **Bulk operations** - Apply brand kit to multiple videos at once
6. **Preview generation** - Generate quick preview before full processing
7. **Analytics integration** - Track which brand kits perform best
8. **Template presets** - Pre-configured brand kits for common use cases
9. **Version history** - Track changes to brand kits over time
10. **Export/import** - Share brand kits between installations

## Conclusion

The Brand Kit System provides a comprehensive solution for maintaining consistent visual identity across all your video content. When combined with the Template System, it enables rapid, on-brand video creation with minimal manual effort.

For support or questions, refer to the main documentation or contact the development team.
