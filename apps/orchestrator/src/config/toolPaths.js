import path from 'path';

export const getToolPaths = () => {
  const toolsDir = process.env.TOOLS_DIR || './tools';
  
  return {
    ffmpeg: process.env.FFMPEG_PATH || path.join(toolsDir, 'ffmpeg/bin/ffmpeg.exe'),
    piper: process.env.PIPER_PATH || path.join(toolsDir, 'piper/bin/piper.exe'),
    whisper: process.env.WHISPER_PATH || path.join(toolsDir, 'whisper/bin/main.exe'),
    godot: process.env.GODOT_PATH || path.join(toolsDir, 'godot/bin/godot.exe')
  };
};

export const getProcessingSettings = () => ({
  maxVideoDuration: parseInt(process.env.MAX_VIDEO_DURATION) || 60,
  defaultFps: parseInt(process.env.DEFAULT_VIDEO_FPS) || 30,
  defaultResolution: process.env.DEFAULT_VIDEO_RESOLUTION || '1080x1920',
  audioLoudnessTarget: parseInt(process.env.AUDIO_LOUDNESS_TARGET) || -16
});