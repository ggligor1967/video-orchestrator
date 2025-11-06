import { z } from 'zod';

// Script generation schema
export const ScriptGenerationSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500, 'Topic must be less than 500 characters'),
  genre: z.enum(['horror', 'mystery', 'paranormal', 'true crime'])
});

export type ScriptGenerationRequest = z.infer<typeof ScriptGenerationSchema>;

export const ScriptGenerationResponseSchema = z.object({
  script: z.string(),
  hooks: z.array(z.string()),
  hashtags: z.array(z.string())
});

export type ScriptGenerationResponse = z.infer<typeof ScriptGenerationResponseSchema>;

// Background asset schemas
export const BackgroundImportResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number(),
  duration: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  aspectRatio: z.string().nullable()
});

export type BackgroundImportResponse = z.infer<typeof BackgroundImportResponseSchema>;

// TTS schemas
export const TTSGenerationSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  voice: z.string().min(1, 'Voice is required').default('en_US-amy-medium'),
  speed: z.number().min(0.1).max(3.0).default(1.0),
  pitch: z.number().min(0.1).max(3.0).default(1.0),
  volume: z.number().min(0.1).max(2.0).default(1.0),
  emphasis: z.string().default('normal'),
  pauseLength: z.string().default('normal')
});

export type TTSGenerationRequest = z.infer<typeof TTSGenerationSchema>;

export const TTSGenerationResponseSchema = z.object({
  id: z.string(),
  path: z.string(),
  relativePath: z.string(),
  voice: z.string(),
  speed: z.number(),
  textLength: z.number(),
  generatedAt: z.string()
});

export type TTSGenerationResponse = z.infer<typeof TTSGenerationResponseSchema>;

// Audio processing schemas
export const AudioSettings = z.object({
  voiceoverVolume: z.number().min(0).max(2).default(1),
  musicVolume: z.number().min(0).max(1).default(0.5),
  sfxVolume: z.number().min(0).max(1).default(0.8),
  fadeInDuration: z.number().min(0).default(1),
  fadeOutDuration: z.number().min(0).default(2),
  normalize: z.boolean().default(true),
  compressor: z.boolean().default(false)
});

export const VoiceSettings = z.object({
  speed: z.number().min(0.5).max(2).default(1),
  pitch: z.number().min(0.5).max(2).default(1),
  volume: z.number().min(0).max(2).default(1),
  emphasis: z.string().optional().default('normal'),
  pauseLength: z.string().optional().default('normal')
});

export const AudioProcessingSchema = z.object({
  voiceover: z.string(),
  backgroundMusic: z.string().nullable(),
  soundEffects: z.array(z.object({
    path: z.string(),
    startTime: z.number().min(0),
    volume: z.number().min(0).max(1)
  })),
  settings: z.object({
    voiceoverVolume: z.number().min(0).max(2),
    musicVolume: z.number().min(0).max(1),
    sfxVolume: z.number().min(0).max(1),
    fadeInDuration: z.number().min(0),
    fadeOutDuration: z.number().min(0),
    normalize: z.boolean(),
    compressor: z.boolean()
  })
});

export type AudioProcessingRequest = z.infer<typeof AudioProcessingSchema>;

// Subtitle schemas
export const SubtitleSettings = z.object({
  fontSize: z.number().min(8).max(72).optional(),
  fontColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundOpacity: z.number().min(0).max(1).optional(),
  position: z.enum(['top', 'center', 'bottom']).optional(),
  fontFamily: z.string().optional(),
  strokeWidth: z.number().min(0).max(10).optional(),
  strokeColor: z.string().optional(),
  maxWordsPerLine: z.number().min(1).max(20).optional(),
  minDuration: z.number().min(0.1).optional(),
  maxDuration: z.number().min(0.1).optional()
});

export const SubtitleGenerationSchema = z.object({
  audioPath: z.string(),
  settings: SubtitleSettings.optional()
});

export type SubtitleGenerationRequest = z.infer<typeof SubtitleGenerationSchema>;

export const SubtitleGenerationResponseSchema = z.object({
  srtPath: z.string(),
  entries: z.array(z.object({
    index: z.number(),
    start: z.number(),
    end: z.number(),
    text: z.string()
  })),
  wordCount: z.number(),
  duration: z.number()
});

export type SubtitleGenerationResponse = z.infer<typeof SubtitleGenerationResponseSchema>;

// Export schemas
export const ExportVideoSchema = z.object({
  script: z.string(),
  background: z.string(),
  voiceover: z.string(),
  audio: z.string(),
  subtitles: z.string().nullable(),
  settings: z.object({
    preset: z.enum(['tiktok', 'youtube', 'instagram', 'custom']),
    resolution: z.string(),
    framerate: z.number().min(1).max(120),
    videoBitrate: z.number().min(100).max(100000),
    audioBitrate: z.number().min(64).max(512),
    includeSubtitles: z.boolean(),
    burnInSubtitles: z.boolean(),
    progressBar: z.boolean(),
    partBadge: z.boolean(),
    outputName: z.string()
  })
});

export type ExportVideoRequest = z.infer<typeof ExportVideoSchema>;

export const ExportVideoResponseSchema = z.object({
  id: z.string(),
  path: z.string(),
  relativePath: z.string(),
  preset: z.object({
    name: z.string(),
    resolution: z.string(),
    fps: z.number(),
    videoBitrate: z.number(),
    audioBitrate: z.number()
  }),
  fileSize: z.number(),
  duration: z.number(),
  width: z.number(),
  height: z.number(),
  hasAudio: z.boolean(),
  hasSubtitles: z.boolean(),
  effects: z.record(z.string(), z.unknown()),
  compiledAt: z.string()
});

export type ExportVideoResponse = z.infer<typeof ExportVideoResponseSchema>;

// Pipeline schemas
export const PipelineBuildSchema = z.object({
  topic: z.string().min(1),
  genre: z.enum(['horror', 'mystery', 'paranormal', 'true crime']),
  backgroundId: z.string(),
  voiceSettings: z.object({
    voice: z.string(),
    speed: z.number().min(0.1).max(3),
    pitch: z.number().min(0.1).max(3)
  }),
  exportSettings: z.object({
    preset: z.enum(['tiktok', 'youtube', 'instagram', 'custom']),
    outputName: z.string()
  })
});

export type PipelineBuildRequest = z.infer<typeof PipelineBuildSchema>;

export const PipelineBuildResponseSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  message: z.string()
});

export type PipelineBuildResponse = z.infer<typeof PipelineBuildResponseSchema>;

export const PipelineJobStatusSchema = z.object({
  id: z.string(),
  stage: z.string(),
  progress: z.number(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  error: z.string().nullable(),
  results: z.object({
    processedVideo: z.unknown().optional(),
    ttsAudio: z.unknown().optional(),
    subtitles: z.unknown().optional(),
    finalVideo: z.unknown().optional()
  }).optional()
});

export type PipelineJobStatus = z.infer<typeof PipelineJobStatusSchema>;

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown().optional(),
  message: z.string().optional()
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;