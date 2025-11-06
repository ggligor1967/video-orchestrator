# Piper - Local Text-to-Speech

## Overview
Piper is a fast, local neural text-to-speech system that produces high-quality voices.

## Files
- `bin/piper.exe` - Main TTS executable
- `models/` - Voice model files (.onnx + .json)
- `espeak-ng-data/` - Phoneme data for text processing
- Supporting DLLs for ONNX runtime

## Available Models
- `en_US-amy-medium.onnx` - English (US) female voice
- Additional models can be downloaded from Piper releases

## Usage in Video Orchestrator
- Generate voice-overs from AI scripts
- Multiple voice selection
- Speed and pitch control
- High-quality audio output (22kHz)

## Installation
1. Download Piper from: https://github.com/rhasspy/piper/releases
2. Extract to `tools/piper/`
3. Download voice models to `models/` directory
4. Ensure all DLL dependencies are present

## Model Downloads
Voice models available at: https://huggingface.co/rhasspy/piper-voices
- English: en_US-amy-medium, en_US-libritts-high
- Romanian: ro_RO-mihai-medium
- Other languages available

## Configuration
Models are automatically detected by the TTS service.
Configure voice selection in the application settings.