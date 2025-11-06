import path from 'path';

export class ExternalVideoService {
  constructor({ logger, pictoryService, kapwingService, ffmpegService, config }) {
    this.logger = logger;
    this.pictory = pictoryService;
    this.kapwing = kapwingService;
    this.ffmpeg = ffmpegService;
    this.exportsDir = config.EXPORTS_DIR || './data/exports';
  }

  async processVideo(options) {
    const { method, ...params } = options;

    this.logger.info('Processing video with external service', { method });

    switch (method) {
      case 'pictory':
        return this.processPictory(params);
      case 'kapwing':
        return this.processKapwing(params);
      case 'local':
        return this.processLocal(params);
      case 'hybrid':
        return this.processHybrid(params);
      default:
        throw new Error(`Unknown processing method: ${method}`);
    }
  }

  async processPictory(params) {
    this.logger.info('Processing with Pictory', { name: params.name });

    try {
      const job = await this.pictory.createVideoFromScript({
        script: params.script,
        voiceId: params.voiceId,
        aspectRatio: params.aspectRatio || '9:16',
        brandKit: params.brandKit,
        name: params.name
      });

      const outputPath = path.join(this.exportsDir, `pictory-${job.jobId}.mp4`);
      await this.pictory.downloadVideo(job.jobId, outputPath);

      this.logger.info('Pictory processing completed', { outputPath });
      
      return {
        success: true,
        videoPath: outputPath,
        method: 'pictory',
        jobId: job.jobId,
        processingTime: 180
      };
    } catch (error) {
      this.logger.error('Pictory processing failed', { error: error.message });
      throw error;
    }
  }

  async processKapwing(params) {
    this.logger.info('Processing with Kapwing', { name: params.name });

    try {
      const project = await this.kapwing.createProject({
        name: params.name,
        width: 1080,
        height: 1920,
        duration: params.duration || 60
      });

      if (params.backgroundPath) {
        const bgUrl = await this.kapwing.uploadFile(params.backgroundPath);
        await this.kapwing.addLayer(project.id, {
          type: 'video',
          url: bgUrl,
          startTime: 0
        });
      }

      if (params.audioPath) {
        const audioUrl = await this.kapwing.uploadFile(params.audioPath);
        await this.kapwing.addLayer(project.id, {
          type: 'audio',
          url: audioUrl,
          startTime: 0
        });
      }

      if (params.subtitles) {
        await this.kapwing.addSubtitles(project.id, params.subtitles, params.captionStyle);
      }

      if (params.logoPath) {
        const logoUrl = await this.kapwing.uploadFile(params.logoPath);
        await this.kapwing.addLayer(project.id, {
          type: 'image',
          url: logoUrl,
          position: 'top-right',
          opacity: 0.8
        });
      }

      const jobId = await this.kapwing.renderVideo(project.id, '1080p');
      const outputPath = path.join(this.exportsDir, `kapwing-${project.id}.mp4`);
      await this.kapwing.downloadVideo(jobId, outputPath);

      this.logger.info('Kapwing processing completed', { outputPath });
      
      return {
        success: true,
        videoPath: outputPath,
        method: 'kapwing',
        projectId: project.id,
        jobId,
        processingTime: 300
      };
    } catch (error) {
      this.logger.error('Kapwing processing failed', { error: error.message });
      throw error;
    }
  }

  async processLocal(params) {
    this.logger.info('Processing locally with FFmpeg', { name: params.name });

    try {
      // Use existing FFmpeg service for local processing
      const outputPath = path.join(this.exportsDir, `local-${Date.now()}.mp4`);
      
      await this.ffmpeg.composeVideo({
        background: params.backgroundPath,
        audio: params.audioPath,
        subtitles: params.subtitlesPath,
        output: outputPath,
        aspectRatio: params.aspectRatio || '9:16'
      });

      this.logger.info('Local processing completed', { outputPath });
      
      return {
        success: true,
        videoPath: outputPath,
        method: 'local',
        processingTime: 600
      };
    } catch (error) {
      this.logger.error('Local processing failed', { error: error.message });
      throw error;
    }
  }

  async processHybrid(params) {
    this.logger.info('Processing with hybrid method', { name: params.name });

    try {
      // Step 1: Generate base video with Pictory
      this.logger.info('Step 1: Generating base video with Pictory');
      const pictoryResult = await this.processPictory({
        script: params.script,
        voiceId: params.voiceId,
        name: `${params.name}-base`
      });

      // Step 2: Enhance with Kapwing (smart resize, advanced captions)
      this.logger.info('Step 2: Enhancing with Kapwing');
      const kapwingResult = await this.processKapwing({
        name: `${params.name}-enhanced`,
        backgroundPath: pictoryResult.videoPath,
        audioPath: params.audioPath,
        subtitles: params.subtitles,
        captionStyle: params.captionStyle || 'tiktok-viral'
      });

      // Step 3: Final touches with local FFmpeg (brand kit, watermark)
      if (params.brandKit) {
        this.logger.info('Step 3: Applying brand kit locally');
        const finalPath = path.join(this.exportsDir, `hybrid-${Date.now()}.mp4`);
        
        await this.ffmpeg.addBrandKit({
          inputPath: kapwingResult.videoPath,
          outputPath: finalPath,
          brandKit: params.brandKit
        });

        this.logger.info('Hybrid processing completed', { outputPath: finalPath });
        
        return {
          success: true,
          videoPath: finalPath,
          method: 'hybrid',
          steps: ['pictory', 'kapwing', 'local'],
          processingTime: 480
        };
      }

      return kapwingResult;
    } catch (error) {
      this.logger.error('Hybrid processing failed', { error: error.message });
      throw error;
    }
  }

  async getProcessingEstimate(method) {
    const estimates = {
      pictory: { time: 180, quality: 'high', cost: 0 },
      kapwing: { time: 300, quality: 'very-high', cost: 0 },
      local: { time: 600, quality: 'high', cost: 0 },
      hybrid: { time: 480, quality: 'maximum', cost: 0 }
    };

    return estimates[method] || estimates.local;
  }

  async batchProcess(videos, method = 'kapwing') {
    this.logger.info('Starting batch processing', { count: videos.length, method });

    if (method === 'kapwing') {
      const template = {
        width: 1080,
        height: 1920,
        layers: [
          { type: 'video', sourceKey: 'backgroundPath' },
          { type: 'audio', sourceKey: 'audioPath' },
          { type: 'text', sourceKey: 'subtitles' }
        ]
      };

      return await this.kapwing.batchProcess(videos, template);
    }

    // Fallback to sequential processing
    const results = [];
    for (const video of videos) {
      try {
        const result = await this.processVideo({ method, ...video });
        results.push(result);
      } catch (error) {
        this.logger.error('Batch item failed', { videoId: video.id, error: error.message });
        results.push({ success: false, error: error.message, videoId: video.id });
      }
    }

    return results;
  }
}
