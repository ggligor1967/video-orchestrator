import { z } from 'zod';

// Base types
export interface ProjectContext {
  script: {
    topic: string;
    genre: 'horror' | 'mystery' | 'paranormal' | 'true crime';
    generated: string;
    hooks: string[];
    hashtags: string[];
  };
  background: {
    selectedId: string | null;
    path: string | null;
    info: BackgroundInfo | null;
    processed: boolean;
  };
  voiceover: {
    audioPath: string | null;
    voice: string | null;
    settings: VoiceSettings | null;
    generated: boolean;
    duration: number | null;
  };
  audio: {
    processedPath: string | null;
    settings: AudioSettings | null;
    backgroundMusic: AudioAsset | null;
    soundEffects: SoundEffect[];
    processed: boolean;
    duration: number | null;
  };
  subtitles: {
    srtPath: string | null;
    settings: SubtitleSettings | null;
    entries: SubtitleEntry[];
    generated: boolean;
    wordCount: number | null;
  };
  export: {
    videoPath: string | null;
    settings: ExportSettings | null;
    size: number | null;
    duration: number | null;
    exported: boolean;
  };
}

export interface BackgroundInfo {
  id: string;
  filename: string;
  path: string;
  size: number;
  duration: number | null;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
}

export interface BackgroundSuggestion {
  title: string;
  description: string;
  keywords: string[];
  ambiance: string;
  idealUseCase?: string;
}

export interface AudioAsset {
  id: string;
  filename: string;
  path: string;
  size: number;
  duration: number | null;
  type: string;
}

export interface SoundEffect extends AudioAsset {
  startTime: number;
  volume: number;
}

export interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  emphasis: string;
  pauseLength: string;
}

export interface AudioSettings {
  voiceoverVolume: number;
  musicVolume: number;
  sfxVolume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  normalize: boolean;
  compressor: boolean;
}

export interface SubtitleSettings {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: 'top' | 'center' | 'bottom';
  fontFamily: string;
  strokeWidth: number;
  strokeColor: string;
  maxWordsPerLine: number;
  minDuration: number;
  maxDuration: number;
}

export interface SubtitleEntry {
  index: number;
  start: number;
  end: number;
  text: string;
}

export interface ExportSettings {
  preset: 'tiktok' | 'youtube' | 'instagram' | 'custom';
  resolution: string;
  framerate: number;
  videoBitrate: number;
  audioBitrate: number;
  includeSubtitles: boolean;
  burnInSubtitles: boolean;
  progressBar: boolean;
  partBadge: boolean;
  outputName: string;
}

// Tab status types
export type TabStatus = 'pending' | 'active' | 'completed';

export interface TabInfo {
  id: string;
  name: string;
  status: TabStatus;
  canProceed: boolean;
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'healthy';
  timestamp: string;
  services: {
    ffmpeg: boolean;
    piper: boolean;
    whisper: boolean;
  };
}

// Voice types
export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  description?: string;
}

// Export status
export interface ExportStatus {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  videoPath?: string;
  size?: number;
  duration?: number;
  error?: string;
}
