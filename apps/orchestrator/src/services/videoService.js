import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { getToolPaths, getProcessingSettings } from '../config/toolPaths.js';

export class VideoService {
  constructor({ logger, ffmpegService }) {
    this.logger = logger;
    this.ffmpegService = ffmpegService;
    this.toolPaths = getToolPaths();
    this.settings = getProcessingSettings();
    this.cacheDir = process.env.VIDEO_CACHE_DIR || './data/cache';
    this.exportsDir = process.env.EXPORTS_DIR || './data/exports';
    
    // Set FFmpeg path for fluent-ffmpeg
    ffmpeg.setFfmpegPath(this.toolPaths.ffmpeg);
    ffmpeg.setFfprobePath(this.toolPaths.ffmpeg.replace('ffmpeg.exe', 'ffprobe.exe'));
  }

  async processBackground(inputPath, options = {}) {
    const { duration = 60, platform = 'tiktok' } = options;
    
    await fs.mkdir(this.cacheDir, { recursive: true });
    const outputPath = path.join(this.cacheDir, `bg_${Date.now()}.mp4`);
    
    try {
      await fs.access(inputPath);
      
      // Create FFmpeg filter chain for 9:16 processing
      const filters = [
        this.createCropFilter(),
        this.createScaleFilter(platform),
        this.createSpeedRampFilter(duration)
      ];
      
      await this.runFFmpeg(inputPath, outputPath, filters);
      
      this.logger.info('Background processed successfully', {
        inputPath,
        outputPath,
        duration,
        platform
      });
      
      return {
        id: uuidv4(),
        path: outputPath,
        duration,
        platform,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Background processing failed', { error: error.message, inputPath });
      throw new Error(`Failed to process background: ${error.message}`);
    }
  }

  createCropFilter() {
    // Crop to 9:16 aspect ratio (center crop)
    return 'crop=ih*9/16:ih';
  }

  createScaleFilter(platform) {
    const resolutions = {
      tiktok: '1080:1920',
      youtube: '1080:1920', 
      instagram: '1080:1920'
    };
    return `scale=${resolutions[platform] || resolutions.tiktok}`;
  }

  createSpeedRampFilter(duration) {
    // Progressive zoom after 2 seconds
    const frames = duration * this.settings.defaultFps;
    return `zoompan=z='if(lt(on,60),1,min(1.5,zoom+0.001))':d=${frames}:s=1080x1920`;
  }

  async compositeVideo(layers) {
    const { background, audio, subtitles, overlays, platform = 'tiktok' } = layers;
    
    await fs.mkdir(this.exportsDir, { recursive: true });
    const outputPath = path.join(this.exportsDir, `video_${Date.now()}.mp4`);
    
    try {
      const filters = [];
      
      // Add subtitle burn-in if provided
      if (subtitles) {
        filters.push(`subtitles=${subtitles}`);
      }
      
      // Add overlays (progress bar, part badge)
      if (overlays?.progressBar) {
        filters.push(this.createProgressBarFilter());
      }
      
      if (overlays?.partNumber) {
        filters.push(this.createPartBadgeFilter(overlays.partNumber));
      }
      
      await this.runCompositeFFmpeg(background, audio, outputPath, filters, platform);
      
      this.logger.info('Video composite completed', {
        outputPath,
        platform,
        hasSubtitles: !!subtitles,
        hasOverlays: !!overlays
      });
      
      return {
        id: uuidv4(),
        path: outputPath,
        platform,
        layers: Object.keys(layers),
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Video composite failed', { error: error.message, layers });
      throw new Error(`Failed to composite video: ${error.message}`);
    }
  }

  createProgressBarFilter() {
    // Simple progress bar overlay at bottom
    return 'drawbox=x=0:y=ih-10:w=iw*t/duration:h=10:color=white@0.8';
  }

  createPartBadgeFilter(partNumber) {
    // Part number badge in top-right corner
    return `drawtext=text='Part ${partNumber}':x=w-tw-20:y=20:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5`;
  }

  getExportPreset(platform) {
    const presets = {
      tiktok: { videoBitrate: '8000k', audioBitrate: '128k' },
      youtube: { videoBitrate: '10000k', audioBitrate: '192k' },
      instagram: { videoBitrate: '8000k', audioBitrate: '128k' }
    };
    return presets[platform] || presets.tiktok;
  }

  async runFFmpeg(inputPath, outputPath, filters) {
    return new Promise((resolve, reject) => {
      this.logger.debug('FFmpeg processing', { inputPath, outputPath, filters });
      
      let cmd = ffmpeg(inputPath);
      
      // Apply video filters
      if (filters && filters.length > 0) {
        cmd = cmd.videoFilters(filters);
      }
      
      cmd
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.debug('FFmpeg command', { commandLine });
        })
        .on('progress', (progress) => {
          this.logger.debug('FFmpeg progress', { percent: progress.percent });
        })
        .on('end', () => {
          this.logger.debug('FFmpeg processing complete', { outputPath });
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('FFmpeg error', { error: err.message, stderr });
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .run();
    });
  }

  async runCompositeFFmpeg(background, audio, outputPath, filters, platform) {
    const preset = this.getExportPreset(platform);
    
    return new Promise((resolve, reject) => {
      this.logger.debug('FFmpeg composite', { background, audio, outputPath, filters, preset });
      
      let cmd = ffmpeg()
        .input(background)
        .input(audio);
      
      // Apply complex filters if provided
      if (filters && filters.length > 0) {
        cmd = cmd.complexFilter(filters);
      }
      
      cmd
        .videoBitrate(preset.videoBitrate)
        .audioBitrate(preset.audioBitrate)
        .audioCodec('aac')
        .videoCodec('libx264')
        .outputOptions([
          '-preset fast',
          '-pix_fmt yuv420p'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.debug('FFmpeg composite command', { commandLine });
        })
        .on('progress', (progress) => {
          this.logger.debug('FFmpeg composite progress', { percent: progress.percent });
        })
        .on('end', () => {
          this.logger.debug('FFmpeg composite complete', { outputPath });
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('FFmpeg composite error', { error: err.message, stderr });
          reject(new Error(`FFmpeg composite failed: ${err.message}`));
        })
        .run();
    });
  }

  async getVideoInfo(videoPath) {
    try {
      await fs.access(videoPath);
      
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) {
            this.logger.error('FFprobe error', { error: err.message, videoPath });
            return reject(new Error(`Failed to probe video: ${err.message}`));
          }
          
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
          
          if (!videoStream) {
            return reject(new Error('No video stream found in file'));
          }
          
          // Parse frame rate (e.g., "30/1" -> 30)
          let fps = this.settings.defaultFps;
          if (videoStream.r_frame_rate) {
            const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
            fps = den > 0 ? Math.round(num / den) : fps;
          }
          
          resolve({
            id: uuidv4(),
            path: videoPath,
            duration: metadata.format.duration || 0,
            width: videoStream.width,
            height: videoStream.height,
            fps,
            size: metadata.format.size,
            format: metadata.format.format_name,
            hasAudio: !!audioStream,
            bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate) : null
          });
        });
      });
    } catch (error) {
      this.logger.error('Failed to get video info', { error: error.message, videoPath });
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  async cropToVertical(inputPath, options = {}) {
    const { smartCrop = false, focusPoint = 'center' } = options;
    
    const outputPath = path.join(this.cacheDir, `cropped_${Date.now()}.mp4`);
    
    try {
      await fs.access(inputPath);
      
      const filters = [
        this.createCropFilter(),
        this.createScaleFilter('tiktok')
      ];
      
      if (smartCrop) {
        // Add smart crop detection (placeholder)
        filters.unshift(`crop=ih*9/16:ih:${this.getFocusOffset(focusPoint)}`);
      }
      
      await this.runFFmpeg(inputPath, outputPath, filters);
      
      return {
        id: uuidv4(),
        path: outputPath,
        smartCrop,
        focusPoint,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Crop to vertical failed', { error: error.message, inputPath });
      throw new Error(`Failed to crop video: ${error.message}`);
    }
  }

  getFocusOffset(focusPoint) {
    const offsets = {
      left: '0',
      center: '(iw-ow)/2',
      right: 'iw-ow'
    };
    return offsets[focusPoint] || offsets.center;
  }
}

// Factory function
export const createVideoService = ({ logger, ffmpegService }) => {
  return new VideoService({ logger, ffmpegService });
};

// Legacy export
export const videoService = {
  cropToVertical: async (params) => {
    const service = new VideoService({ 
      logger: console, 
      ffmpegService: { getVideoInfo: () => ({}) } 
    });
    return service.cropToVertical(params.inputPath, params);
  },
  getVideoInfo: async (videoPath) => {
    const service = new VideoService({ 
      logger: console, 
      ffmpegService: { getVideoInfo: () => ({}) } 
    });
    return service.getVideoInfo(videoPath);
  }
};