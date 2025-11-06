import { z } from 'zod';
import { PipelineBuildSchema } from '@video-orchestrator/shared';

const buildVideoSchema = PipelineBuildSchema.extend({
  options: z.object({
    generateSubtitles: z.boolean().optional().default(true),
    addProgressBar: z.boolean().optional().default(false),
    partBadge: z.string().optional(),
    speedRamp: z.boolean().optional().default(true),
    audioNormalization: z.boolean().optional().default(true)
  }).optional()
});

export const createPipelineController = ({ pipelineService, logger }) => ({
  async buildVideo(req, res, next) {
    try {
      const validatedData = buildVideoSchema.parse(req.body);

      logger.info('Processing end-to-end video build request', {
        scriptLength: validatedData.script.length,
        backgroundId: validatedData.backgroundId,
        voice: validatedData.voice,
        preset: validatedData.preset
      });

      const result = await pipelineService.buildCompleteVideo(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const status = await pipelineService.getJobStatus(jobId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }
});
