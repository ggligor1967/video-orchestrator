// Main export file for the shared package

export * from './types.js';
export * from './schemas.js';
export * from './utils.js';

// Re-export commonly used types and functions
export type {
  ProjectContext,
  BackgroundInfo,
  BackgroundSuggestion,
  AudioAsset,
  ExportSettings,
  TabStatus,
  TabInfo,
  Notification,
  NotificationType,
  ApiResponse
} from './types.js';

export {
  ScriptGenerationSchema,
  ScriptGenerationResponseSchema,
  TTSGenerationSchema,
  TTSGenerationResponseSchema,
  AudioProcessingSchema,
  SubtitleGenerationSchema,
  SubtitleGenerationResponseSchema,
  ExportVideoSchema,
  ExportVideoResponseSchema,
  PipelineBuildSchema,
  PipelineBuildResponseSchema,
  PipelineJobStatusSchema,
  BackgroundImportResponseSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  SubtitleSettings,
  AudioSettings,
  VoiceSettings
} from './schemas.js';

export {
  generateId,
  formatFileSize,
  formatDuration,
  formatDetailedDuration,
  parseTimeToSeconds,
  isVerticalAspectRatio,
  getVerticalDimensions,
  isValidAudioType,
  isValidVideoType,
  sanitizeFilename,
  truncateText
} from './utils.js';
