import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { videoService } from './videoService.js';
import { ttsService } from './ttsService.js';
import { subsService } from './subsService.js';
import { exportService } from './exportService.js';
import { assetsService } from './assetsService.js';
import { serviceDependencyValidator } from './serviceDependencyValidator.js';
import { logger } from '../utils/logger.js';
import { isPathSafe } from '../utils/pathSecurity.js';
import { cacheService } from './cacheService.js';

// Job status tracking
const jobs = new Map();

const JOB_STAGES = {
  STARTED: 'started',
  PROCESSING_VIDEO: 'processing_video',
  GENERATING_TTS: 'generating_tts',
  GENERATING_SUBTITLES: 'generating_subtitles',
  COMPILING: 'compiling',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Resolves backgroundIdOrPath to an absolute file path
 * @param {string} backgroundIdOrPath - Either a background ID (e.g., "bg-123") or an absolute path
 * @returns {Promise<string>} - Absolute path to the background video file
 */
async function resolveBackgroundPath(backgroundIdOrPath) {
  // Check if it's an absolute path (contains path separators or starts with drive letter on Windows)
  const isAbsolutePath = path.isAbsolute(backgroundIdOrPath) || 
                         backgroundIdOrPath.includes('/') || 
                         backgroundIdOrPath.includes('\\');
  
  if (isAbsolutePath) {
    // Validate path safety to prevent path traversal attacks
    if (!isPathSafe(backgroundIdOrPath, ['data'])) {
      throw new Error('Invalid or unsafe file path');
    }
    return backgroundIdOrPath;
  }
  
  // It's an ID, resolve it through assetsService
  const backgroundInfo = await assetsService.getBackgroundInfo(backgroundIdOrPath);
  // Convert the relative path to absolute (backgroundInfo.path is like "/static/assets/backgrounds/file.mp4")
  const filename = path.basename(backgroundInfo.path);
  return path.join(process.cwd(), 'data', 'assets', 'backgrounds', filename);
}

export const pipelineService = {
  async buildCompleteVideo(request) {
    // Validate pipeline dependencies
    const validation = await serviceDependencyValidator.validate('pipeline', 'buildCompleteVideo', request);
    if (!validation.valid) {
      logger.error('Pipeline dependency validation failed', { errors: validation.errors });
      throw new Error(`Pipeline validation failed: ${validation.errors.join('; ')}`);
    }
    
    // Validate pipeline stage order
    const stages = ['video', 'tts', 'subs', 'export'];
    const orderValidation = serviceDependencyValidator.validatePipelineOrder(stages);
    if (!orderValidation.valid) {
      logger.warn('Pipeline stage order suboptimal', { warnings: orderValidation.warnings });
    }
    
    // Normalize voice parameter: accept both "voice" and "voiceId" for backwards compatibility
    // batchService uses voiceId, but ttsService expects voice
    if (!request.voice && request.voiceId) {
      request.voice = request.voiceId;
    }
    
    const jobId = uuidv4();
    const job = {
      id: jobId,
      stage: JOB_STAGES.STARTED,
      progress: 0,
      startedAt: new Date().toISOString(),
      request,
      results: {},
      error: null
    };
    
    jobs.set(jobId, job);
    
    logger.info('Starting end-to-end video build', { 
      jobId, 
      backgroundId: request.backgroundId,
      scriptLength: request.script.length,
      voice: request.voice // Log normalized voice parameter
    });

    // Run the pipeline asynchronously
    this.runPipeline(jobId, request).catch(error => {
      logger.error('Pipeline failed', { jobId, error: error.message });
      job.stage = JOB_STAGES.FAILED;
      job.error = error.message;
      job.completedAt = new Date().toISOString();
    });

    return {
      jobId,
      status: 'started',
      message: 'Video build pipeline initiated'
    };
  },

  async runPipeline(jobId, request) {
    const job = jobs.get(jobId);
    
    try {
      // Check cache for identical pipeline runs
      const cacheKey = cacheService.generateKey('pipeline', {
        backgroundId: request.backgroundId,
        script: request.script,
        voice: request.voice,
        preset: request.preset
      });
      const cached = await cacheService.get(cacheKey);
      if (cached && cached.finalVideo) {
        logger.info('Pipeline result retrieved from cache', { jobId });
        job.results = cached;
        job.stage = JOB_STAGES.COMPLETED;
        job.progress = 100;
        job.completedAt = new Date().toISOString();
        return;
      }

      // Stage 1: Process background video (crop to vertical, apply speed ramp)
      job.stage = JOB_STAGES.PROCESSING_VIDEO;
      job.progress = 10;
      
      logger.info('Pipeline Stage 1: Processing video', { jobId });
      
      // Resolve background ID or path to absolute path
      const backgroundPath = await resolveBackgroundPath(request.backgroundId);
      
      // Crop background to vertical
      const croppedVideo = await videoService.cropToVertical({
        inputPath: backgroundPath,
        outputPath: path.join(process.cwd(), 'data', 'cache', `pipeline_${jobId}_cropped.mp4`)
      });
      job.results.croppedVideo = croppedVideo;
      job.progress = 25;

      // Apply speed ramp if requested
      let processedVideo = croppedVideo;
      if (request.options?.speedRamp !== false) {
        processedVideo = await videoService.applySpeedRamp({
          inputPath: croppedVideo.path,
          outputPath: path.join(process.cwd(), 'data', 'cache', `pipeline_${jobId}_ramp.mp4`),
          startTime: 2
        });
        job.results.processedVideo = processedVideo;
      }
      job.progress = 40;

      // Stage 2 & 3: Parallel TTS and subtitle generation
      job.stage = JOB_STAGES.GENERATING_TTS;
      job.progress = 45;
      
      logger.info('Pipeline Stage 2-3: Generating TTS and subtitles in parallel', { jobId });
      
      const ttsPromise = ttsService.generateSpeech({
        text: request.script,
        voice: request.voice,
        speed: 1.0,
        outputFilename: `pipeline_${jobId}_tts.wav`
      });

      // Wait for TTS first, then generate subtitles (needs audio)
      const ttsAudio = await ttsPromise;
      job.results.ttsAudio = ttsAudio;
      job.progress = 60;

      // Generate subtitles if requested
      let subtitles = null;
      if (request.options?.generateSubtitles !== false) {
        job.stage = JOB_STAGES.GENERATING_SUBTITLES;
        job.progress = 65;
        
        logger.info('Pipeline Stage 3: Generating subtitles', { jobId });
        
        subtitles = await subsService.generateSubtitles({
          audioId: ttsAudio.id,
          language: 'en',
          outputFilename: `pipeline_${jobId}_subs.srt`
        });
        job.results.subtitles = subtitles;
      }
      job.progress = 80;

      // Stage 4: Final compilation
      job.stage = JOB_STAGES.COMPILING;
      job.progress = 85;
      
      logger.info('Pipeline Stage 4: Final compilation', { jobId });
      
      const finalVideo = await exportService.compileVideo({
        videoId: processedVideo.id,
        audioId: ttsAudio.id,
        subtitleId: subtitles?.id,
        preset: request.preset,
        outputFilename: `pipeline_${jobId}_final.mp4`,
        effects: {
          progressBar: request.options?.addProgressBar,
          partBadge: request.options?.partBadge
        }
      });
      
      job.results.finalVideo = finalVideo;
      job.progress = 100;
      job.stage = JOB_STAGES.COMPLETED;
      job.completedAt = new Date().toISOString();

      // Cache the complete pipeline result
      await cacheService.set(cacheKey, job.results, { type: 'pipeline', jobId });

      logger.info('Pipeline completed successfully', { 
        jobId, 
        duration: this.calculateDuration(job.startedAt, job.completedAt),
        finalVideoPath: finalVideo.path
      });

    } catch (error) {
      job.stage = JOB_STAGES.FAILED;
      job.error = error.message;
      job.completedAt = new Date().toISOString();
      throw error;
    }
  },

  async getJobStatus(jobId) {
    const job = jobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const status = {
      id: job.id,
      stage: job.stage,
      progress: job.progress,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      isCompleted: job.stage === JOB_STAGES.COMPLETED,
      isFailed: job.stage === JOB_STAGES.FAILED
    };

    // Include results if job is completed
    if (job.stage === JOB_STAGES.COMPLETED) {
      status.results = {
        finalVideo: job.results.finalVideo,
        metadata: {
          backgroundId: job.request.backgroundId,
          voice: job.request.voice,
          preset: job.request.preset,
          hasSubtitles: !!job.results.subtitles,
          scriptLength: job.request.script.length,
          duration: this.calculateDuration(job.startedAt, job.completedAt)
        }
      };
    }

    return status;
  },

  calculateDuration(startTime, endTime) {
    if (!endTime) return null;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    
    return {
      ms: durationMs,
      seconds: Math.round(durationMs / 1000),
      formatted: `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')}`
    };
  },

  // Cleanup old jobs (call periodically)
  cleanupOldJobs(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now();
    
    for (const [jobId, job] of jobs.entries()) {
      const jobAge = now - new Date(job.startedAt).getTime();
      
      if (jobAge > maxAge) {
        jobs.delete(jobId);
        logger.info('Cleaned up old job', { jobId, age: jobAge });
      }
    }
  }
};
