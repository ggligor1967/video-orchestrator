# Video Orchestrator - Detailed Usage Guide

## Overview

Video Orchestrator is a desktop application for creating vertical format videos optimized for social media platforms like TikTok, YouTube Shorts, and Instagram Reels. The application provides both a graphical user interface (GUI) and command-line interface (CLI) for flexibility.

## Installation & Setup

### Prerequisites

1. **Python 3.8+**: Ensure you have Python 3.8 or higher installed
2. **FFmpeg**: Required for video processing

### Installing FFmpeg

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract to a directory (e.g., `C:\ffmpeg`)
3. Add the `bin` folder to your system PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Installing Video Orchestrator

```bash
# Clone the repository
git clone https://github.com/ggligor1967/video-orchestrator.git
cd video-orchestrator

# Install dependencies
pip install -r requirements.txt

# Or install in development mode
pip install -e .
```

## Using the GUI Application

### Starting the Application

```bash
python -m video_orchestrator.main
```

Or if installed via setup.py:
```bash
video-orchestrator
```

### GUI Features

#### Single Video Tab

1. **Adding Media**
   - Click "Add Images" to select multiple image files
   - Click "Add Videos" to select multiple video clips
   - Click "Add Audio" to add background music
   - Use "Clear All" to reset

2. **Configuring Settings**
   - **Source Type**: Choose "Images" or "Videos" based on your media
   - **Duration per Image**: Set how long each image displays (for image mode)
   - **Aspect Ratio Mode**: Choose how to handle non-vertical content
     - *Fit (Letterbox)*: Scales content to fit with black bars
     - *Crop*: Crops content to fill the frame
     - *Blur Background*: Uses blurred version as background
   - **Enable Transitions**: Add smooth crossfade transitions between images

3. **Export Settings**
   - **Output Name**: Name for your video file (without extension)
   - **Format**: Select output format
     - MP4 (H.264): Best compatibility
     - MP4 (H.265): Smaller file size
     - WebM: Web-optimized
     - AVI: Legacy support
   - **Quality**: Choose quality preset
     - High: 8000k bitrate
     - Medium: 4000k bitrate (recommended)
     - Low: 2000k bitrate

4. **Generating Video**
   - Click "Generate Video"
   - Monitor progress bar
   - Video will be saved to `output/` folder

#### Batch Processing Tab

Create multiple videos in one session:

1. Configure a video in the "Single Video" tab
2. Click "Add Current to Batch"
3. Repeat for each video you want to create
4. Go to "Batch Processing" tab
5. Click "Process Batch"
6. Monitor progress and view results

#### Settings Tab

- View AI feature status
- Check output directory location
- Click "Open Output Folder" to browse generated videos
- View application information

## Using the Command Line Interface

The CLI provides programmatic access to Video Orchestrator features.

### Creating Videos from Images

```bash
python examples/cli_example.py images \
    --images img1.jpg img2.jpg img3.jpg \
    --output my_video.mp4 \
    --duration 3.0 \
    --audio background.mp3
```

**Arguments:**
- `--images`: One or more image files (required)
- `--output`: Output filename (required)
- `--duration`: Seconds per image (default: 3.0)
- `--audio`: Optional audio file
- `--no-transitions`: Disable transitions

### Creating Videos from Videos

```bash
python examples/cli_example.py videos \
    --videos clip1.mp4 clip2.mp4 \
    --output combined.mp4 \
    --fill-mode crop \
    --audio music.mp3
```

**Arguments:**
- `--videos`: One or more video files (required)
- `--output`: Output filename (required)
- `--fill-mode`: Aspect ratio handling (fit/crop/blur, default: fit)
- `--audio`: Optional audio to replace/add

### Batch Processing with CLI

Create a JSON configuration file:

```json
[
  {
    "type": "images",
    "media_files": ["img1.jpg", "img2.jpg", "img3.jpg"],
    "audio_file": "music.mp3",
    "output_name": "video1",
    "codec": "libx264",
    "bitrate": "4000k",
    "duration_per_image": 3.0,
    "transitions": true
  },
  {
    "type": "videos",
    "media_files": ["clip1.mp4", "clip2.mp4"],
    "output_name": "video2",
    "codec": "libx264",
    "bitrate": "8000k",
    "fill_mode": "crop"
  }
]
```

Run batch processing:

```bash
python examples/cli_example.py batch \
    --config batch_config.json \
    --workers 2
```

## Creating Test Media

Generate sample images for testing:

```bash
python examples/create_test_media.py
```

This creates 5 colorful test images in `examples/test_media/`.

Test with generated images:

```bash
python examples/cli_example.py images \
    --images examples/test_media/*.jpg \
    --output test_vertical_video.mp4
```

## Video Specifications

### Output Format

- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920 pixels
- **Frame Rate**: 30 fps (default)
- **Video Codec**: H.264 (default), H.265, VP9, or MPEG4
- **Audio Codec**: AAC

### Supported Input Formats

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

**Videos:**
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- MKV (.mkv)
- WebM (.webm)

**Audio:**
- MP3 (.mp3)
- WAV (.wav)
- AAC (.aac)
- OGG (.ogg)
- M4A (.m4a)

## Advanced Features

### AI-Powered Enhancements

Enable AI features for intelligent video optimization:

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Edit `.env`:
```
AI_ENABLED=true
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4
```

3. Restart the application

AI features include:
- Scene order optimization
- Automatic caption generation
- Music recommendations
- Quality analysis
- Smart settings optimization

### Python API

Use Video Orchestrator in your Python projects:

```python
from video_orchestrator.core.video_processor import VideoProcessor

# Initialize processor
processor = VideoProcessor(width=1080, height=1920, fps=30)

# Create video from images
clip = processor.create_from_images(
    image_paths=['img1.jpg', 'img2.jpg', 'img3.jpg'],
    duration_per_image=3.0,
    audio_path='background.mp3',
    transitions=True
)

# Export
processor.export_video(
    clip,
    'output/my_video.mp4',
    codec='libx264',
    bitrate='4000k'
)

# Clean up
clip.close()
```

### Batch Processing API

```python
from video_orchestrator.core.batch_processor import BatchProcessor

# Initialize
batch = BatchProcessor(max_workers=2)

# Define tasks
tasks = [
    {
        'type': 'images',
        'media_files': ['img1.jpg', 'img2.jpg'],
        'output_name': 'video1',
        'codec': 'libx264',
        'bitrate': '4000k'
    },
    # Add more tasks...
]

# Process
results = batch.process_batch(tasks)

# Check results
for result in results:
    print(f"Task {result['task_id']}: {result['status']}")
    if result['output_path']:
        print(f"  Saved to: {result['output_path']}")
```

## Tips & Best Practices

### For Best Quality

1. Use high-resolution source images (1080p or higher)
2. Select "High" quality preset
3. Use lossless audio formats (WAV, FLAC)
4. Keep source files in RGB color space

### For Faster Processing

1. Use lower quality presets
2. Reduce batch size
3. Use H.264 instead of H.265
4. Disable transitions for image videos

### For Smaller File Sizes

1. Use H.265 codec (better compression)
2. Use "Low" or "Medium" quality presets
3. Reduce input resolution before processing
4. Use compressed audio formats (MP3, AAC)

### Social Media Optimization

**TikTok:**
- Use High quality preset
- Keep videos under 3 minutes
- Add engaging audio

**YouTube Shorts:**
- Maximum 60 seconds
- Use High quality for better visibility
- Add clear text overlays

**Instagram Reels:**
- 15-90 seconds optimal
- Use Medium to High quality
- Ensure audio is engaging

## Troubleshooting

### Video Processing Fails

**Problem**: "FFmpeg not found" error

**Solution**:
1. Install FFmpeg (see Installation section)
2. Add FFmpeg to system PATH
3. Restart terminal/application

### Memory Issues

**Problem**: Out of memory during processing

**Solutions**:
1. Process videos individually instead of batch
2. Use lower quality presets
3. Reduce source file resolution
4. Close other applications
5. Increase system swap space

### Slow Performance

**Problem**: Video generation is very slow

**Solutions**:
1. Reduce batch size (use max 2-3 workers)
2. Use SSD instead of HDD for source files
3. Ensure FFmpeg is properly installed
4. Use lower quality presets for testing
5. Close unnecessary applications

### GUI Won't Start

**Problem**: PyQt6 import errors

**Solution**:
```bash
pip install --upgrade PyQt6
```

### Audio Sync Issues

**Problem**: Audio doesn't match video duration

**Note**: The application automatically:
- Loops short audio to match video length
- Trims long audio to match video length

To fix manually:
- Edit audio file to exact video duration
- Use video editing software for precise sync

## Output Directory

Videos are saved to: `output/`

You can change this by modifying `config.py`:
```python
OUTPUT_DIR = Path("/your/custom/path")
```

## Logging

Logs are written to console by default. To enable file logging:

```python
from video_orchestrator.utils.logger import setup_logger

logger = setup_logger('video_orchestrator', log_file='app.log')
```

## Performance Notes

**Processing Time Estimates:**
- 5 images → ~30 seconds
- 10 images → ~1 minute
- 3 video clips (30s each) → ~2-3 minutes
- Batch of 10 videos → ~10-20 minutes

Times vary based on:
- Source resolution
- Output quality
- System performance
- Codec selection

## Getting Help

- **Issues**: Open an issue on GitHub
- **Documentation**: Check README.md and this guide
- **Examples**: See `examples/` directory
- **Tests**: Run `pytest tests/` to verify installation

## License

See LICENSE file for details.
