import { z } from 'zod';
import { ErrorResponses } from '../utils/errorResponse.js';

// Simple normalization schema for /audio/normalize endpoint
const normalizeRequestSchema = z.object({
  inputPath: z.string().min(1, 'Input path is required'),
  outputPath: z.string().optional(),
  lufsTarget: z.number().min(-70).max(0).optional().default(-16),
  peakLimit: z.number().min(-20).max(0).optional().default(-1.0)
});

const trackSchema = z.object({
  path: z.string().min(1, 'Track path is required'),
  volume: z.number().min(0).max(2).optional().default(1.0),
  startTime: z.number().min(0).optional().default(0),
  fadeIn: z.number().min(0).max(10).optional().default(0),
  fadeOut: z.number().min(0).max(10).optional().default(0),
  type: z.enum(['voice', 'background', 'sfx']).optional().default('background')
});

const mixOptionsSchema = z.object({
  normalize: z.boolean().optional().default(false),
  duckingEnabled: z.boolean().optional().default(false),
  duckingAmount: z.number().min(0.1).max(1).optional().default(0.3),
  duckingThreshold: z.number().min(-60).max(0).optional().default(-30),
  crossfade: z.number().min(0).max(10).optional().default(0)
});

const mixRequestSchema = z.object({
  tracks: z.array(trackSchema).min(1, 'At least 1 audio track required'),
  outputPath: z.string().optional(),
  options: mixOptionsSchema.optional()
});

export const createAudioController = ({ audioService, logger }) => ({
  async normalizeAudio(req, res, next) {
    try {
      const validatedData = normalizeRequestSchema.parse(req.body);

      logger.info('Processing audio normalization request', {
        inputPath: validatedData.inputPath,
        lufsTarget: validatedData.lufsTarget,
        peakLimit: validatedData.peakLimit
      });

      const result = await audioService.normalizeAudio(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async mixAudio(req, res, next) {
    try {
      const validatedData = mixRequestSchema.parse(req.body);

      logger.info('Processing audio mix request', {
        trackCount: validatedData.tracks.length,
        tracks: validatedData.tracks.map(t => ({ 
          path: t.path, 
          volume: t.volume, 
          fadeIn: t.fadeIn, 
          fadeOut: t.fadeOut,
          type: t.type
        })),
        options: validatedData.options
      });

      const result = await audioService.mixAudio({
        tracks: validatedData.tracks,
        outputPath: validatedData.outputPath,
        options: validatedData.options
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getAudioInfo(req, res, next) {
    try {
      const { path } = req.query;
      
      if (!path) {
        return ErrorResponses.missingField(res, 'path');
      }

      const info = await audioService.getAudioInfo(path);

      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  }
});
