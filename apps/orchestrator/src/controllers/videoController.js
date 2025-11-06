import { z } from 'zod';
import { ErrorResponses } from '../utils/errorResponse.js';

// Video processing specific schemas
const cropRequestSchema = z.object({
  inputPath: z.string().min(1, 'Input path is required'),
  aspectRatio: z.enum(['9:16', '16:9', '1:1', '4:5']).optional().default('9:16'),
  outputPath: z.string().optional(),
  smartCrop: z.boolean().optional().default(false),
  focusPoint: z.enum(['center', 'top', 'bottom']).optional().default('center')
});

const autoReframeRequestSchema = z.object({
  inputPath: z.string().min(1, 'Input path is required'),
  targetAspect: z.enum(['9:16', '16:9', '1:1', '4:5']).optional().default('9:16'),
  outputPath: z.string().optional(),
  detectionMode: z.enum(['face', 'motion', 'center']).optional().default('face')
});

const speedRampRequestSchema = z.object({
  inputPath: z.string().min(1, 'Input path is required'),
  startTime: z.number().min(0).optional().default(2),
  endTime: z.number().min(0),
  speedMultiplier: z.number().min(0.5).max(3.0).optional().default(1.5),
  outputPath: z.string().optional()
}).refine(data => data.endTime > data.startTime, {
  message: 'End time must be greater than start time',
  path: ['endTime']
});

const mergeAudioRequestSchema = z.object({
  videoPath: z.string().min(1, 'Video path is required'),
  audioPath: z.string().min(1, 'Audio path is required'),
  outputPath: z.string().optional(),
  audioVolume: z.number().min(0).max(2.0).optional().default(1.0),
  backgroundMusicPath: z.string().optional(),
  musicVolume: z.number().min(0).max(1.0).optional().default(0.3)
});

export const createVideoController = ({ videoService, logger }) => ({
  async cropToVertical(req, res, next) {
    try {
      const validatedData = cropRequestSchema.parse(req.body);

      logger.info('Processing video crop request', {
        inputPath: validatedData.inputPath,
        aspectRatio: validatedData.aspectRatio,
        smartCrop: validatedData.smartCrop,
        focusPoint: validatedData.focusPoint
      });

      const result = await videoService.cropToVertical(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async autoReframe(req, res, next) {
    try {
      const validatedData = autoReframeRequestSchema.parse(req.body);

      logger.info('Processing auto-reframe request', {
        inputPath: validatedData.inputPath,
        targetAspect: validatedData.targetAspect,
        detectionMode: validatedData.detectionMode
      });

      const result = await videoService.autoReframe(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async applySpeedRamp(req, res, next) {
    try {
      const validatedData = speedRampRequestSchema.parse(req.body);

      logger.info('Processing speed ramp request', {
        inputPath: validatedData.inputPath,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        speedMultiplier: validatedData.speedMultiplier
      });

      const result = await videoService.applySpeedRamp(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async mergeWithAudio(req, res, next) {
    try {
      const validatedData = mergeAudioRequestSchema.parse(req.body);

      logger.info('Processing video-audio merge request', {
        videoPath: validatedData.videoPath,
        audioPath: validatedData.audioPath,
        audioVolume: validatedData.audioVolume,
        backgroundMusicPath: validatedData.backgroundMusicPath,
        musicVolume: validatedData.musicVolume
      });

      const result = await videoService.mergeWithAudio(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getVideoInfo(req, res, next) {
    try {
      const { path } = req.query;
      
      if (!path) {
        return ErrorResponses.missingField(res, 'path');
      }

      const info = await videoService.getVideoInfo(path);

      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  }
});
