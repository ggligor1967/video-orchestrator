# Video Orchestrator Examples

This directory contains example scripts for using Video Orchestrator.

## Command Line Example

The `cli_example.py` script demonstrates how to use Video Orchestrator from the command line without the GUI.

### Usage

```bash
# Create video from images
python examples/cli_example.py images \
    --images image1.jpg image2.jpg image3.jpg \
    --output my_video.mp4 \
    --duration 3.0 \
    --audio background.mp3

# Create video from existing videos
python examples/cli_example.py videos \
    --videos video1.mp4 video2.mp4 \
    --output combined.mp4 \
    --fill-mode fit

# Batch processing
python examples/cli_example.py batch \
    --config batch_config.json
```

## Creating Test Media

You can use the `create_test_media.py` script to generate sample images for testing:

```bash
python examples/create_test_media.py
```

This will create several test images in the `examples/test_media/` directory.
