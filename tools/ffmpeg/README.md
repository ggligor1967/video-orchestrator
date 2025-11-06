# FFmpeg - Video Processing Tool

## Overview
FFmpeg is a complete, cross-platform solution to record, convert and stream audio and video.

## Files
- `bin/ffmpeg.exe` - Main video processing executable
- `bin/ffprobe.exe` - Media file analyzer
- `bin/ffplay.exe` - Simple media player

## Usage in Video Orchestrator
- Video format conversion (MP4, AVI, MOV → MP4)
- Aspect ratio conversion (16:9 → 9:16 for vertical videos)
- Video cropping and scaling
- Audio mixing and normalization
- Subtitle embedding
- Speed ramping effects

## Installation
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `tools/ffmpeg/bin/`
3. Ensure all three executables are present

## Version Requirements
- FFmpeg 4.4+ recommended
- Windows 64-bit build required

## Configuration
The application automatically detects FFmpeg in this directory.
No additional configuration required.