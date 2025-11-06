"""Configuration settings for the Video Orchestrator application."""

import os
from pathlib import Path

# Application settings
APP_NAME = "Video Orchestrator"
APP_VERSION = "1.0.0"

# Directories
BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "output"
TEMP_DIR = BASE_DIR / "temp"

# Ensure directories exist
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# Video settings
VERTICAL_ASPECT_RATIO = (9, 16)  # Width:Height for vertical videos
DEFAULT_WIDTH = 1080
DEFAULT_HEIGHT = 1920
DEFAULT_FPS = 30
DEFAULT_DURATION = 15  # seconds

# Supported formats
SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
SUPPORTED_VIDEO_FORMATS = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
SUPPORTED_AUDIO_FORMATS = ['.mp3', '.wav', '.aac', '.ogg', '.m4a']

# Export settings
EXPORT_FORMATS = {
    'MP4 (H.264)': {'codec': 'libx264', 'ext': '.mp4'},
    'MP4 (H.265)': {'codec': 'libx265', 'ext': '.mp4'},
    'WebM': {'codec': 'libvpx-vp9', 'ext': '.webm'},
    'AVI': {'codec': 'mpeg4', 'ext': '.avi'},
}

QUALITY_PRESETS = {
    'High': {'bitrate': '8000k'},
    'Medium': {'bitrate': '4000k'},
    'Low': {'bitrate': '2000k'},
}

# AI settings (placeholders for future AI integration)
AI_ENABLED = os.getenv('AI_ENABLED', 'false').lower() == 'true'
AI_API_KEY = os.getenv('AI_API_KEY', '')
AI_MODEL = os.getenv('AI_MODEL', 'gpt-4')

# Batch processing
MAX_BATCH_SIZE = 50
