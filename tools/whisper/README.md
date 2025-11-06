# Whisper.cpp - Speech-to-Text

## Overview
Whisper.cpp is a C++ implementation of OpenAI's Whisper automatic speech recognition model.

## Files
- `bin/main.exe` - Whisper executable (renamed from main.exe)
- `models/` - Whisper model files (.bin format)
- Supporting DLLs (ggml, SDL2, whisper)

## Available Models
- `ggml-base.en.bin` - Base English model (74MB)
- Additional models can be downloaded:
  - `ggml-tiny.bin` - Tiny model (39MB, fastest)
  - `ggml-small.bin` - Small model (244MB)
  - `ggml-medium.bin` - Medium model (769MB, better accuracy)
  - `ggml-large.bin` - Large model (1550MB, best accuracy)

## Usage in Video Orchestrator
- Generate subtitles from voice-over audio
- Automatic speech recognition
- Multiple language support
- ASS subtitle format output

## Installation
1. Download Whisper.cpp from: https://github.com/ggerganov/whisper.cpp/releases
2. Extract to `tools/whisper/`
3. Download models to `models/` directory
4. Ensure all DLL dependencies are present

## Model Downloads
```bash
# Download models (run from tools/whisper/models/)
curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin -o ggml-base.en.bin
curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin -o ggml-medium.bin
```

## Performance
- Base model: ~2x real-time on modern CPU
- Medium model: ~1x real-time, better accuracy
- GPU acceleration available with CUDA builds

## Configuration
Models are automatically detected by the subtitle service.
Configure model selection based on accuracy vs speed requirements.