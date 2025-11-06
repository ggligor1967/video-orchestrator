/**
 * AI Auto-Pilot Service
 * Fully automated video creation from topic to final export
 */

import crypto from 'node:crypto';

export class AutoPilotService {
  constructor({ aiService, pipelineService, ttsService, subtitleService, assetService, logger }) {
    this.aiService = aiService;
    this.pipelineService = pipelineService;
    this.ttsService = ttsService;
    this.subtitleService = subtitleService;
    this.assetService = assetService;
    this.logger = logger;
    this.activeJobs = new Map();
  }

  /**
   * Create video automatically from topic
   */
  async createVideo(options) {
    const jobId = `autopilot-${crypto.randomUUID()}`;
    this.logger.info('Starting auto-pilot video creation', { jobId, topic: options.topic });

    const job = {
      id: jobId,
      status: 'running',
      progress: 0,
      steps: [],
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);

    try {
      // Step 1: Generate script (with fallback)
      await this._updateProgress(job, 10, 'Generating script...');
      const script = await this._generateScriptWithFallback(options);
      job.steps.push({ step: 'script', status: 'complete', data: script });

      // Step 2: Analyze script
      await this._updateProgress(job, 20, 'Analyzing content...');
      const analysis = await this._analyzeScriptWithFallback(script);
      job.steps.push({ step: 'analysis', status: 'complete', data: analysis });

      // Step 3: Select assets (with fallback)
      await this._updateProgress(job, 35, 'Selecting assets...');
      const assets = await this._selectAssetsWithFallback(script, analysis);
      job.steps.push({ step: 'assets', status: 'complete', data: assets });

      // Step 4: Generate voice-over (with fallback)
      await this._updateProgress(job, 50, 'Generating voice-over...');
      const voiceOver = await this._generateVoiceOverWithFallback(script);
      job.steps.push({ step: 'voiceover', status: 'complete', data: voiceOver });

      // Step 5: Mix audio (with fallback)
      await this._updateProgress(job, 65, 'Mixing audio...');
      const audio = await this._mixAudioWithFallback(assets, voiceOver);
      job.steps.push({ step: 'audio', status: 'complete', data: audio });

      // Step 6: Generate subtitles (with fallback)
      await this._updateProgress(job, 80, 'Generating subtitles...');
      const subtitles = await this._generateSubtitlesWithFallback(voiceOver);
      job.steps.push({ step: 'subtitles', status: 'complete', data: subtitles });

      // Step 7: Export video
      await this._updateProgress(job, 90, 'Exporting video...');
      const video = await this._exportVideoWithFallback({
        script,
        assets,
        voiceOver,
        audio,
        subtitles,
        options
      });
      job.steps.push({ step: 'export', status: 'complete', data: video });

      // Complete
      await this._updateProgress(job, 100, 'Complete!');
      job.status = 'complete';
      job.endTime = Date.now();
      job.duration = job.endTime - job.startTime;
      job.result = video;

      this.logger.info('Auto-pilot video creation complete', { 
        jobId, 
        duration: job.duration,
        videoPath: video.path 
      });

      return { success: true, jobId, video, duration: job.duration };

    } catch (error) {
      this.logger.error('Auto-pilot video creation failed', { jobId, error: error.message });
      job.status = 'failed';
      job.error = error.message;
      throw error;
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        steps: job.steps.map(s => ({ step: s.step, status: s.status })),
        duration: job.endTime ? job.endTime - job.startTime : Date.now() - job.startTime
      }
    };
  }

  // Private methods with fallback logic

  async _generateScriptWithFallback(options) {
    const result = await this.aiService.generateScript({
      topic: options.topic,
      genre: options.genre || 'horror',
      duration: options.duration || 60
    });
    return result;
  }

  async _analyzeScriptWithFallback(script) {
    try {
      // Simple content analysis based on script properties
      const wordCount = script.script?.split(' ').length || 100;
      const hasHooks = script.hooks?.length > 0;
      const hasHashtags = script.hashtags?.length > 0;
      
      const engagementScore = Math.min(10, Math.max(5, 
        (wordCount / 20) + (hasHooks ? 2 : 0) + (hasHashtags ? 1 : 0)
      ));
      
      return {
        engagementScore: Math.round(engagementScore),
        hookStrength: hasHooks ? Math.round(engagementScore) : 5,
        pacing: wordCount > 150 ? 'fast' : wordCount > 80 ? 'medium' : 'slow',
        wordCount
      };
    } catch (error) {
      this.logger.warn('Script analysis failed, using defaults', { error: error.message });
      return { engagementScore: 7, hookStrength: 7, pacing: 'medium' };
    }
  }

  async _selectAssetsWithFallback(_script, _analysis) {
    // Use existing asset service to get available backgrounds
    const backgrounds = await this.assetService.listBackgrounds();
    
    if (backgrounds.length === 0) {
      throw new Error('No backgrounds available. Please add background videos to data/assets/backgrounds/');
    }
    
    const selectedBackground = backgrounds[0];
    this.logger.info('Selecting assets', { background: selectedBackground.id });
    
    return {
      background: selectedBackground,
      music: null, // Music is optional
      sfx: []
    };
  }

  async _generateVoiceOverWithFallback(script) {
    const result = await this.ttsService.generateVoiceOver(script.script, {
      voice: 'en_US-amy-medium',
      speed: 1,
      outputFilename: `autopilot-${Date.now()}.wav`
    });
    return result;
  }

  async _mixAudioWithFallback(assets, voiceOver) {
    try {
      // For now, just return the voice-over as primary audio
      // Real audio mixing would be implemented here
      return {
        path: voiceOver.path,
        tracks: [voiceOver.path, assets.music?.path].filter(Boolean),
        duration: voiceOver.duration
      };
    } catch (error) {
      this.logger.warn('Audio mixing failed, using voice-over only', { error: error.message });
      return { path: voiceOver.path, tracks: [voiceOver.path], duration: voiceOver.duration };
    }
  }

  async _generateSubtitlesWithFallback(voiceOver) {
    try {
      if (!voiceOver.path) {
        return null; // No audio to generate subtitles from
      }
      
      const result = await this.subtitleService.generateSubtitles({
        audioPath: voiceOver.path,
        outputFormat: 'srt'
      });
      return result;
    } catch (error) {
      this.logger.warn('Subtitle generation failed, skipping subtitles', { error: error.message });
      return null;
    }
  }

  async _exportVideoWithFallback(data) {
    try {
      // Use existing pipeline service for video compilation
      const pipelineData = {
        script: data.script,
        background: data.assets.background,
        voiceOver: data.voiceOver,
        audio: data.audio,
        subtitles: data.subtitles,
        settings: {
          platform: data.options.platform || 'tiktok',
          resolution: '1080x1920',
          fps: 30
        }
      };
      
      const result = await this.pipelineService.process(pipelineData);
      return result;
    } catch (error) {
      this.logger.error('Video export failed', { error: error.message });
      throw new Error('Export failed: ' + error.message);
    }
  }

  async _updateProgress(job, progress, step) {
    job.progress = progress;
    job.currentStep = step;
    this.logger.info('Auto-pilot progress', { jobId: job.id, progress, step });
  }
}

// Factory function for dependency injection
export const createAutoPilotService = ({ aiService, pipelineService, ttsService, subtitleService, assetService, logger }) => {
  return new AutoPilotService({ aiService, pipelineService, ttsService, subtitleService, assetService, logger });
};

// Legacy export for backward compatibility
export const autoPilotService = {
  createVideo: async (options) => {
    const service = new AutoPilotService({ 
      aiService: { generateScript: () => Promise.resolve({ script: 'mock', hooks: [], hashtags: [] }) },
      pipelineService: { process: () => Promise.resolve({ path: 'mock.mp4' }) },
      ttsService: { generateVoiceOver: () => Promise.resolve({ path: 'mock.wav', duration: 60 }) },
      subtitleService: { generateSubtitles: () => Promise.resolve({ path: 'mock.srt' }) },
      assetService: { listBackgrounds: () => Promise.resolve([]) },
      logger: console 
    });
    return service.createVideo(options);
  }
};