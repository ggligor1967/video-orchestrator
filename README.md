# Video Orchestrator

**AI-powered desktop application for creating automated vertical videos (TikTok/Shorts/Reels)**

A powerful desktop application that automates the creation and editing of vertical format videos perfect for TikTok, YouTube Shorts, and Instagram Reels. Features include batch processing, multiple export formats, and AI-powered enhancements.

## Features

- 🎬 **Vertical Video Generation**: Automatically formats videos to 9:16 aspect ratio (1080x1920)
- 🖼️ **Image to Video**: Create videos from sequences of images with customizable transitions
- 🎥 **Video Processing**: Convert and combine existing videos to vertical format
- 🎵 **Audio Support**: Add background music or audio tracks to your videos
- ⚡ **Batch Processing**: Process multiple videos simultaneously
- 📤 **Multiple Export Formats**: Support for MP4 (H.264/H.265), WebM, and AVI
- 🎨 **Aspect Ratio Handling**: Choose between fit (letterbox), crop, or blur background modes
- 🤖 **AI-Powered Features**: Optional AI enhancements for scene ordering and quality improvements
- 🎯 **Quality Presets**: High, Medium, and Low quality export options

## Installation

### Requirements

- Python 3.8 or higher
- FFmpeg (required by MoviePy)

### Steps

1. Clone the repository:
```bash
git clone https://github.com/ggligor1967/video-orchestrator.git
cd video-orchestrator
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

Or install in development mode:
```bash
pip install -e .
```

3. Install FFmpeg (if not already installed):
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt-get install ffmpeg` (Ubuntu/Debian)

## Usage

### Running the Application

Run from the command line:
```bash
python -m video_orchestrator.main
```

Or if installed via setup.py:
```bash
video-orchestrator
```

### Creating a Single Video

1. Launch the application
2. Go to the "Single Video" tab
3. Click "Add Images" or "Add Videos" to import your media
4. (Optional) Click "Add Audio" to add background music
5. Configure your video settings:
   - Source Type: Choose "Images" or "Videos"
   - Duration per Image: How long each image displays (for images)
   - Aspect Ratio Mode: How to handle non-vertical content (for videos)
   - Enable Transitions: Smooth transitions between images
6. Set export options:
   - Output Name: Name for your video file
   - Format: Choose video codec (MP4, WebM, etc.)
   - Quality: Select quality preset (High/Medium/Low)
7. Click "Generate Video"
8. Wait for processing to complete
9. Find your video in the `output/` folder

### Batch Processing

1. Go to the "Batch Processing" tab
2. Configure each video in the "Single Video" tab
3. Click "Add Current to Batch" to queue it
4. Repeat for each video you want to create
5. Switch back to "Batch Processing" tab
6. Click "Process Batch" to generate all videos
7. Monitor progress and view results

### Export Formats

**Supported Formats:**
- MP4 (H.264): Best compatibility, recommended for most platforms
- MP4 (H.265): Smaller file size, newer codec
- WebM: Open format, good for web
- AVI: Legacy format

**Quality Presets:**
- High: 8000k bitrate
- Medium: 4000k bitrate (recommended)
- Low: 2000k bitrate

### Aspect Ratio Handling

When converting horizontal videos to vertical format:

- **Fit (Letterbox)**: Scales video to fit with black bars
- **Crop**: Crops video to fill frame (may cut content)
- **Blur Background**: Uses blurred version as background with original centered

## Configuration

### AI Features (Optional)

AI features can be enabled by setting environment variables:

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and set:
```
AI_ENABLED=true
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-4
```

AI features include:
- Scene order suggestions
- Auto-caption generation
- Music recommendations
- Quality analysis
- Enhanced settings optimization

## Project Structure

```
video-orchestrator/
├── video_orchestrator/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration settings
│   ├── core/                # Core processing logic
│   │   ├── video_processor.py   # Video generation engine
│   │   ├── batch_processor.py   # Batch processing
│   │   └── ai_engine.py         # AI features
│   ├── ui/                  # User interface
│   │   └── main_window.py       # Main application window
│   └── utils/               # Utility functions
│       ├── logger.py            # Logging setup
│       └── file_utils.py        # File handling
├── output/                  # Generated videos (created on first run)
├── temp/                    # Temporary files (created on first run)
├── requirements.txt         # Python dependencies
├── setup.py                # Package configuration
├── .gitignore
├── .env.example            # Environment configuration template
└── README.md
```

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=video_orchestrator
```

### Code Style

The project follows PEP 8 style guidelines. Format code with:
```bash
black video_orchestrator/
```

## Troubleshooting

### FFmpeg Not Found
If you get an error about FFmpeg not being found:
1. Install FFmpeg (see Installation section)
2. Ensure FFmpeg is in your system PATH
3. Restart the application

### Out of Memory
For large batches or high-resolution videos:
1. Reduce batch size
2. Use lower quality preset
3. Process videos individually

### Slow Processing
Video processing is CPU-intensive:
1. Close other applications
2. Reduce batch size
3. Use lower resolution source files
4. Ensure FFmpeg is properly installed

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

- Built with [PyQt6](https://www.riverbankcomputing.com/software/pyqt/) for the UI
- Powered by [MoviePy](https://zulko.github.io/moviepy/) for video processing
- Uses [FFmpeg](https://ffmpeg.org/) as the video processing backend
