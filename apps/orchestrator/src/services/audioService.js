import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ffmpegService } from './ffmpegService.js';
import { logger } from '../utils/logger.js';
import { paths } from '../config/paths.js';

const CACHE_DIR = paths.cache;

export const audioService = {
  async normalizeAudio({ inputPath, outputPath, lufsTarget, peakLimit: _peakLimit }) {
    try {
      // Resolve paths to absolute
      const resolvedInputPath = path.resolve(process.cwd(), inputPath);
      const resolvedOutputPath = outputPath ? path.resolve(process.cwd(), outputPath) : path.join(CACHE_DIR, `normalized_${Date.now()}.wav`);

      // Validate input file exists
      await fs.access(resolvedInputPath);

      await ffmpegService.normalizeAudio(resolvedInputPath, resolvedOutputPath, lufsTarget);

      return {
        id: uuidv4(),
        path: resolvedOutputPath,
        relativePath: `/static/cache/${path.basename(resolvedOutputPath)}`,
        lufs: lufsTarget,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error normalizing audio', { error: error.message, inputPath });
      throw new Error(`Failed to normalize audio: ${error.message}`);
    }
  },

  async mixAudio({ tracks, outputPath, options = {} }) {
    try {
      // Validate inputs
      if (!tracks || tracks.length === 0) {
        throw new Error('At least one audio track is required');
      }
      
      // Resolve all track paths to absolute
      const resolvedTracks = tracks.map(track => ({
        ...track,
        path: path.resolve(process.cwd(), track.path)
      }));

      // Validate all input files exist and have content
      await Promise.all(resolvedTracks.map(async track => {
        await fs.access(track.path);
        const stats = await fs.stat(track.path);
        if (stats.size === 0) {
          throw new Error(`Audio track ${track.path} is empty`);
        }
      }));

      const resolvedOutputPath = outputPath ? path.resolve(process.cwd(), outputPath) : path.join(CACHE_DIR, `mixed_${Date.now()}.wav`);
      
      logger.info('Mixing audio tracks', {
        trackCount: resolvedTracks.length,
        outputPath: resolvedOutputPath
      });

      // Get audio info for each track to enable advanced features
      const tracksWithInfo = await Promise.all(
        resolvedTracks.map(async (track) => {
          const info = await ffmpegService.getVideoInfo(track.path);
          return {
            ...track,
            duration: info.duration
          };
        })
      );

      // Apply advanced mixing with fade, ducking, and normalization
      await this._advancedMixAudio(tracksWithInfo, resolvedOutputPath, options);

      logger.info('Audio mixed successfully', { 
        trackCount: tracks.length,
        outputPath: resolvedOutputPath,
        options
      });

      return {
        id: uuidv4(),
        path: resolvedOutputPath,
        relativePath: `/static/cache/${path.basename(resolvedOutputPath)}`,
        tracks: tracks.map(t => ({ 
          path: t.path, 
          volume: t.volume,
          fadeIn: t.fadeIn,
          fadeOut: t.fadeOut
        })),
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error mixing audio', { error: error.message, trackCount: tracks?.length });
      throw new Error(`Failed to mix audio: ${error.message}`);
    }
  },

  /**
   * Advanced audio mixing with fade effects, ducking, and normalization
   * @private
   */
  async _advancedMixAudio(tracks, outputPath, options = {}) {
    const {
      normalize = false,
      duckingEnabled = false,
      duckingAmount = 0.3, // Reduce background to 30% when voice is present
      duckingThreshold = -30, // dB threshold for voice detection
      crossfade = 0 // Crossfade duration in seconds
    } = options;

    return new Promise((resolve, reject) => {
      logger.info('Advanced audio mixing', { 
        trackCount: tracks.length, 
        normalize,
        duckingEnabled,
        crossfade,
        outputPath 
      });

      // Import fluent-ffmpeg for advanced mixing
      const fluentFfmpeg = globalThis.require?.('fluent-ffmpeg') || {};
      const ffmpeg = fluentFfmpeg;
      const command = ffmpeg ? ffmpeg() : null;

      // Add all input tracks
      tracks.forEach(track => command.input(track.path));

      // Build complex filter chain
      const filters = [];
      const filterOutputs = [];

      tracks.forEach((track, i) => {
        const inputLabel = `[${i}:a]`;
        let filterChain = inputLabel;
        const chainParts = [];

        // Apply fade in
        if (track.fadeIn && track.fadeIn > 0) {
          chainParts.push(`afade=t=in:st=${track.startTime || 0}:d=${track.fadeIn}`);
        }

        // Apply fade out
        if (track.fadeOut && track.fadeOut > 0 && track.duration) {
          const fadeOutStart = (track.startTime || 0) + track.duration - track.fadeOut;
          chainParts.push(`afade=t=out:st=${fadeOutStart}:d=${track.fadeOut}`);
        }

        // Apply volume adjustment
        const volume = track.volume !== undefined ? track.volume : 1.0;
        chainParts.push(`volume=${volume}`);

        // Apply delay/offset
        if (track.startTime && track.startTime > 0) {
          const delayMs = Math.round(track.startTime * 1000);
          chainParts.push(`adelay=${delayMs}|${delayMs}`);
        }

        // Apply ducking (for background music tracks)
        if (duckingEnabled && track.type === 'background') {
          // Find the voice track index
          const voiceTrackIndex = tracks.findIndex(t => t.type === 'voice');
          if (voiceTrackIndex !== -1) {
            // Use sidechaincompress for ducking
            const voiceLabel = `[${voiceTrackIndex}:a]`;
            filterChain = `${inputLabel}${voiceLabel}sidechaincompress=threshold=${duckingThreshold}dB:ratio=4:attack=1:release=50:makeup=${1/duckingAmount}`;
            filterOutputs.push(`[a${i}]`);
            filters.push(`${filterChain}[a${i}]`);
            return;
          }
        }

        // Build the complete filter chain
        if (chainParts.length > 0) {
          filterChain = `${inputLabel}${chainParts.join(',')}`;
        }

        filterOutputs.push(`[a${i}]`);
        filters.push(`${filterChain}[a${i}]`);
      });

      // Apply crossfade between tracks if requested
      if (crossfade > 0 && tracks.length === 2) {
        filters.push(`${filterOutputs[0]}${filterOutputs[1]}acrossfade=d=${crossfade}:c1=tri:c2=tri[aout]`);
      } else {
        // Standard mix without crossfade
        const mixInputs = filterOutputs.join('');
        filters.push(`${mixInputs}amix=inputs=${tracks.length}:duration=longest:dropout_transition=2[aout]`);
      }

      // Apply final normalization if requested
      if (normalize) {
        filters.push('[aout]loudnorm=I=-16:TP=-1.5:LRA=11[aout]');
      }

      command
        .complexFilter(filters)
        .outputOptions('-map', '[aout]')
        .audioCodec('aac')
        .audioBitrate('192k')
        .audioChannels(2)
        .output(outputPath)
        .on('start', (commandLine) => {
          logger.debug('FFmpeg command:', { commandLine });
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            logger.debug('Mixing progress:', { percent: progress.percent });
          }
        })
        .on('end', () => {
          logger.info('Advanced audio mixing completed', { outputPath });
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Error in advanced audio mixing', { error: err.message });
          reject(new Error(`FFmpeg mixing failed: ${err.message}`));
        })
        .run();
    });
  },

  async getAudioInfo(audioPath) {
    try {
      // Resolve path to absolute
      const resolvedPath = path.resolve(process.cwd(), audioPath);
      
      // Validate file exists
      await fs.access(resolvedPath);
      
      const info = await ffmpegService.getVideoInfo(resolvedPath); // FFmpeg can handle audio too
      
      return {
        id: uuidv4(),
        duration: info.duration,
        hasAudio: info.hasAudio,
        audioCodec: info.audioCodec,
        bitrate: info.bitrate,
        path: resolvedPath
      };
    } catch (error) {
      logger.error('Error getting audio info', { error: error.message, audioPath });
      throw new Error(`Failed to get audio info: ${error.message}`);
    }
  }
};