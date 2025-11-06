import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ffmpegService } from './ffmpegService.js';
import { logger } from '../utils/logger.js';
import { paths } from '../config/paths.js';

const EXPORTS_DIR = paths.exports;
const CACHE_DIR = paths.cache;

const EXPORT_PRESETS = {
  tiktok: {
    name: 'TikTok',
    platform: 'tiktok',
    resolution: '1080x1920',
    fps: 30,
    videoBitrate: '8000k',
    audioBitrate: '192k',
    audioCodec: 'aac',
    videoCodec: 'libx264',
    maxDuration: 180, // 3 minutes
    description: 'Optimized for TikTok vertical videos'
  },
  youtube: {
    name: 'YouTube Shorts',
    platform: 'youtube',
    resolution: '1080x1920',
    fps: 30,
    videoBitrate: '12000k',
    audioBitrate: '192k',
    audioCodec: 'aac',
    videoCodec: 'libx264',
    maxDuration: 60, // 1 minute
    description: 'Optimized for YouTube Shorts'
  },
  instagram: {
    name: 'Instagram Reels',
    platform: 'instagram',
    resolution: '1080x1920',
    fps: 30,
    videoBitrate: '8000k',
    audioBitrate: '192k',
    audioCodec: 'aac',
    videoCodec: 'libx264',
    maxDuration: 90, // 1.5 minutes
    description: 'Optimized for Instagram Reels'
  }
};

export const exportService = {
  async compileVideo({ videoId, audioId, subtitleId, preset, outputFilename, effects }) {
    // Track all temporary files for cleanup
    const tempFiles = [];
    
    try {
      // Ensure exports directory exists
      await fs.mkdir(EXPORTS_DIR, { recursive: true });
      
      const presetConfig = EXPORT_PRESETS[preset];
      if (!presetConfig) {
        throw new Error(`Unknown preset: ${preset}`);
      }

      // Resolve videoId to path (supports both ID and absolute path)
      const videoPath = await this.resolvePathOrId(videoId, 'video');
      const outputPath = path.join(EXPORTS_DIR, outputFilename || `${preset}_${Date.now()}.mp4`);
      
      let tempVideoPath = videoPath;

      // Step 1: Add audio if provided
      if (audioId) {
        const audioPath = await this.resolvePathOrId(audioId, 'audio');
        const tempWithAudio = path.join(CACHE_DIR, `temp_with_audio_${Date.now()}.mp4`);
        tempFiles.push(tempWithAudio); // Track for cleanup
        await ffmpegService.mergeVideoAudio(videoPath, audioPath, tempWithAudio);
        tempVideoPath = tempWithAudio;
      }

      // Step 2: Add subtitles if provided
      if (subtitleId) {
        const subtitlePath = await this.resolvePathOrId(subtitleId, 'subtitle');
        const tempWithSubs = path.join(CACHE_DIR, `temp_with_subs_${Date.now()}.mp4`);
        tempFiles.push(tempWithSubs); // Track for cleanup
        await ffmpegService.addSubtitles(tempVideoPath, subtitlePath, tempWithSubs);
        tempVideoPath = tempWithSubs;
      }

      // Step 3: Apply effects if requested
      if (effects?.progressBar || effects?.partBadge || effects?.watermark) {
        const tempWithEffects = await this.applyEffects(tempVideoPath, effects);
        if (tempWithEffects !== tempVideoPath) {
          tempFiles.push(tempWithEffects); // Track for cleanup
          tempVideoPath = tempWithEffects;
        }
      }

      // Step 4: Final export with preset
      await ffmpegService.exportWithPreset(tempVideoPath, outputPath, preset);

      const videoInfo = await ffmpegService.getVideoInfo(outputPath);
      const stats = await fs.stat(outputPath);

      const id = uuidv4();
      
      logger.info('Video compilation completed', {
        id,
        preset,
        outputPath,
        fileSize: stats.size,
        duration: videoInfo.duration
      });

      return {
        id,
        path: outputPath,
        relativePath: `/static/exports/${path.basename(outputPath)}`,
        preset: presetConfig,
        fileSize: stats.size,
        duration: videoInfo.duration,
        width: videoInfo.width,
        height: videoInfo.height,
        hasAudio: !!audioId || videoInfo.hasAudio,
        hasSubtitles: !!subtitleId,
        effects: effects || {},
        compiledAt: new Date().toISOString()
      };
    } catch (_error) {
      logger.error('Error compiling video', { error: _error.message, videoId, preset });
      throw new Error(`Failed to compile video: ${_error.message}`);
    } finally {
      // Clean up ALL temporary files, even if operation failed
      for (const tempFile of tempFiles) {
        try {
          await fs.unlink(tempFile);
          logger.debug('Cleaned up temporary file', { tempFile });
        } catch (cleanupError) {
          // Ignore cleanup errors (file may not exist or already deleted)
          logger.warn('Could not clean up temporary file', { 
            tempFile, 
            error: cleanupError.message 
          });
        }
      }
    }
  },

  async getAvailablePresets() {
    return Object.entries(EXPORT_PRESETS).map(([key, preset]) => ({
      id: key,
      ...preset
    }));
  },

  async applyEffects(videoPath, effects) {
    const outputPath = path.join(CACHE_DIR, `temp_effects_${Date.now()}.mp4`);
    
    // Build FFmpeg filter chain based on requested effects
    const filters = [];
    
    // Progress bar at bottom (if requested)
    if (effects.progressBar) {
      const { height = 8, color = 'blue', position = 'bottom' } = effects.progressBar;
      const yPos = position === 'top' ? 20 : `ih-${height}-20`; // 20px from edge
      
      // Animated progress bar using drawbox with enable expression
      // Progress grows from left (0%) to right (100%) based on video timestamp
      filters.push(
        `drawbox=x=40:y=${yPos}:w='iw-80':h=${height}:color=black@0.6:t=fill`,
        `drawbox=x=40:y=${yPos}:w='(iw-80)*t/duration':h=${height}:color=${color}:t=fill:enable='t<duration'`
      );
    }
    
    // Part badge (e.g., "Part 1/3") in top-right corner
    if (effects.partBadge) {
      const { current = 1, total = 1, fontSize = 32 } = effects.partBadge;
      const badgeText = `Part ${current}/${total}`;
      
      filters.push(
        `drawtext=text='${badgeText}':fontsize=${fontSize}:fontcolor=white:` +
        `x=w-tw-40:y=40:borderw=2:bordercolor=black@0.8`
      );
    }
    
    // Watermark/logo in bottom-right corner
    if (effects.watermark) {
      const { text, fontSize = 24, opacity = 0.7 } = effects.watermark;
      
      filters.push(
        `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=white@${opacity}:` +
        `x=w-tw-40:y=h-th-40:borderw=1:bordercolor=black@0.5`
      );
    }
    
    // If no effects requested, just copy
    if (filters.length === 0) {
      await fs.copyFile(videoPath, outputPath);
      return outputPath;
    }
    
    // Apply filters using FFmpeg
    const filterComplex = filters.join(',');
    await ffmpegService.runFFmpeg(videoPath, outputPath, filterComplex);
    
    logger.info('Effects applied successfully', { 
      effects, 
      filtersApplied: filters.length,
      outputPath
    });
    
    return outputPath;
  },

  /**
   * Resolves an ID or path to an absolute file path
   * @param {string} idOrPath - Either an ID (e.g., "video-123") or an absolute path
   * @param {string} type - Type of resource: 'video', 'audio', or 'subtitle'
   * @returns {Promise<string>} - Absolute path to the file
   */
  async resolvePathOrId(idOrPath, type) {
    if (!idOrPath) {
      throw new Error(`${type} ID or path is required`);
    }

    // Check if it's an absolute path
    const isAbsolutePath = path.isAbsolute(idOrPath) || 
                           idOrPath.includes('/') || 
                           idOrPath.includes('\\');
    
    if (isAbsolutePath) {
      // It's already a path, validate it exists
      try {
        await fs.access(idOrPath);
        return idOrPath;
      } catch (_error) {
        throw new Error(`${type} file not found at path: ${idOrPath}`);
      }
    }
    
    // It's an ID, resolve it through appropriate helper
    switch (type) {
      case 'video':
        return await this.getVideoPath(idOrPath);
      case 'audio':
        return await this.getAudioPath(idOrPath);
      case 'subtitle':
        return await this.getSubtitlePath(idOrPath);
      default:
        throw new Error(`Unknown resource type: ${type}`);
    }
  },

  async getVideoPath(videoId) {
    // Check cache directory first
    try {
      const cacheFiles = await fs.readdir(CACHE_DIR);
      const cacheFile = cacheFiles.find(f => f.includes(videoId) || path.parse(f).name === videoId);
      if (cacheFile) {
        return path.join(CACHE_DIR, cacheFile);
      }
    } catch (_error) {
      // Directory might not exist
    }
    
    // Check backgrounds directory
    const backgroundsDir = paths.backgrounds;
    try {
      const bgFiles = await fs.readdir(backgroundsDir);
      const bgFile = bgFiles.find(f => path.parse(f).name === videoId);
      if (bgFile) {
        return path.join(backgroundsDir, bgFile);
      }
    } catch (_error) {
      // Directory might not exist
    }
    
    throw new Error(`Video with ID ${videoId} not found`);
  },

  async getAudioPath(audioId) {
    const ttsDir = paths.tts;
    
    // Check TTS directory first
    try {
      const ttsFiles = await fs.readdir(ttsDir);
      const ttsFile = ttsFiles.find(f => f.includes(audioId) || path.parse(f).name === audioId);
      if (ttsFile) {
        return path.join(ttsDir, ttsFile);
      }
    } catch (_error) {
      // Directory might not exist
    }
    
    // Check cache directory
    try {
      const cacheFiles = await fs.readdir(CACHE_DIR);
      const cacheFile = cacheFiles.find(f => f.includes(audioId) || path.parse(f).name === audioId);
      if (cacheFile) {
        return path.join(CACHE_DIR, cacheFile);
      }
    } catch (_error) {
      // Directory might not exist
    }
    
    throw new Error(`Audio with ID ${audioId} not found`);
  },

  async getSubtitlePath(subtitleId) {
    const subsDir = paths.subs;
    
    try {
      const subsFiles = await fs.readdir(subsDir);
      const subsFile = subsFiles.find(f => f.includes(subtitleId) || path.parse(f).name === subtitleId);
      
      if (!subsFile) {
        throw new Error(`Subtitle with ID ${subtitleId} not found`);
      }
      
      return path.join(subsDir, subsFile);
    } catch (_error) {
      throw new Error(`Subtitle with ID ${subtitleId} not found`);
    }
  }
};