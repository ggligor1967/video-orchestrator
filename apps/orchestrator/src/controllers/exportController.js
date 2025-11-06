import { z } from 'zod';
import { ExportVideoSchema } from '@video-orchestrator/shared';

const compileVideoSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  audioId: z.string().optional(),
  subtitleId: z.string().optional(),
  preset: ExportVideoSchema.shape.settings.shape.preset.optional().default('tiktok'),
  outputFilename: z.string().optional(),
  effects: z.object({
    progressBar: z.boolean().optional().default(false),
    partBadge: z.string().optional(),
    watermark: z.string().optional()
  }).optional()
});

export const createExportController = ({ exportService, logger }) => ({
  async compileVideo(req, res, next) {
    try {
      const validatedData = compileVideoSchema.parse(req.body);

      logger.info('Processing video compilation request', {
        videoId: validatedData.videoId,
        preset: validatedData.preset,
        hasAudio: Boolean(validatedData.audioId),
        hasSubtitles: Boolean(validatedData.subtitleId)
      });

      const result = await exportService.compileVideo(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getExportPresets(req, res, next) {
    try {
      const presets = await exportService.getAvailablePresets();

      res.json({
        success: true,
        data: presets
      });
    } catch (error) {
      next(error);
    }
  }
});
