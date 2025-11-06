# Godot Engine - Procedural Background Generator

## Overview
Godot Engine is used to generate procedural voxel backgrounds for video content.

## Files
- `bin/godot.exe` - Godot Engine executable
- `projects/voxel-generator/` - Voxel background generation project

## Usage in Video Orchestrator
- Generate animated voxel backgrounds
- Procedural terrain and structures
- Customizable colors and themes
- Export as video sequences for backgrounds

## Installation
1. Download Godot 4.x from: https://godotengine.org/download
2. Extract to `tools/godot/bin/`
3. Rename executable to `godot.exe`

## Voxel Generator Project
The `voxel-generator` project contains:
- Procedural voxel terrain scripts
- Material and lighting setups
- Export configurations for video sequences
- Customizable parameters (colors, density, animation)

## Project Setup
1. Open Godot Engine
2. Import project from `projects/voxel-generator/`
3. Configure export settings for video output
4. Run generation scripts via Video Orchestrator API

## Requirements
- Godot 4.0+ (4.5 recommended)
- Windows 64-bit build
- OpenGL 3.3+ or Vulkan support
- 4GB+ RAM for complex scenes

## Configuration
The background service automatically launches Godot projects.
Configure generation parameters in the application settings.

## Optional Feature
This tool is optional - the application works without it.
Pre-generated backgrounds are available as fallback.