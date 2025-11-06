# Quick Start Guide

Get started with Video Orchestrator in 5 minutes!

## Step 1: Install

```bash
# Clone repository
git clone https://github.com/ggligor1967/video-orchestrator.git
cd video-orchestrator

# Install dependencies
pip install -r requirements.txt

# Install FFmpeg (if not already installed)
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html
```

## Step 2: Create Test Images

```bash
python examples/create_test_media.py
```

This creates 5 test images in `examples/test_media/`.

## Step 3: Create Your First Video

### Option A: Using the GUI

```bash
python -m video_orchestrator.main
```

1. Click "Add Images"
2. Select the test images from `examples/test_media/`
3. Click "Generate Video"
4. Find your video in the `output/` folder!

### Option B: Using the CLI

```bash
python examples/cli_example.py images \
    --images examples/test_media/*.jpg \
    --output my_first_video.mp4 \
    --duration 3.0
```

Your video will be in `output/my_first_video.mp4`!

## Step 4: Try Batch Processing

```bash
python examples/cli_example.py batch \
    --config examples/batch_config_example.json
```

This creates 2 videos from the example configuration.

## Next Steps

- Read [USAGE.md](USAGE.md) for detailed documentation
- Explore different aspect ratio modes (fit, crop, blur)
- Try adding your own images and videos
- Experiment with audio tracks
- Adjust quality settings for your needs

## Common Commands

**Create video from images:**
```bash
python examples/cli_example.py images \
    --images img1.jpg img2.jpg img3.jpg \
    --output my_video.mp4
```

**Create video with audio:**
```bash
python examples/cli_example.py images \
    --images img1.jpg img2.jpg \
    --audio background.mp3 \
    --output video_with_music.mp4
```

**Convert existing videos to vertical:**
```bash
python examples/cli_example.py videos \
    --videos horizontal_video.mp4 \
    --output vertical_video.mp4 \
    --fill-mode crop
```

## Tips

- Use `--duration 5.0` for slower slideshows
- Try `--fill-mode blur` for artistic backgrounds
- Use high-resolution images for best quality
- Keep videos under 60 seconds for social media

## Need Help?

- Check [README.md](README.md) for features overview
- See [USAGE.md](USAGE.md) for detailed guide
- Open an issue on GitHub for support

Happy video creating! 🎬
