import { z } from 'zod';
import { createPaginatedResponse } from '../middleware/pagination.js';
import { ScriptGenerationSchema } from '@video-orchestrator/shared';

// Batch-specific schemas using shared base schemas
const videoItemSchema = ScriptGenerationSchema.extend({
  backgroundId: z.string().optional(),
  voiceId: z.string().optional(),
  preset: z.enum(['tiktok', 'youtube', 'instagram', 'custom']).optional(),
  includeSubtitles: z.boolean().optional().default(true)
});

const createBatchSchema = z.object({
  videos: z.array(videoItemSchema).min(1, 'At least one video is required').max(50, 'Maximum 50 videos per batch'),
  config: z.object({
    maxConcurrent: z.number().min(1).max(10).optional().default(3),
    stopOnError: z.boolean().optional().default(false),
    notifyOnComplete: z.boolean().optional().default(false)
  }).optional().default({})
});

export const createBatchController = ({ batchService, logger }) => ({
  async createBatch(req, res, next) {
    try {
      const validatedData = createBatchSchema.parse(req.body);

      logger.info('Creating batch job', {
        videoCount: validatedData.videos.length,
        maxConcurrent: validatedData.config.maxConcurrent
      });

      const result = await batchService.createBatchJob(validatedData);

      res.status(202).json({
        success: true,
        data: result,
        message: 'Batch job created and processing started'
      });
    } catch (error) {
      next(error);
    }
  },

  async getBatchStatus(req, res, next) {
    try {
      const { batchId } = req.params;

      logger.info('Getting batch job status', { batchId });

      const status = batchService.getBatchJobStatus(batchId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllBatches(req, res, next) {
    try {
      logger.info('Getting all batch jobs');

      // Check if pagination is requested
      if (req.pagination) {
        const { limit, offset } = req.pagination;
        const result = batchService.getAllBatches({ limit, offset });
        return res.json(createPaginatedResponse(result.items, result.total, req.pagination));
      }

      // Return all items (backwards compatibility)
      const batches = batchService.getAllBatches();
      res.json({
        success: true,
        data: { batches, total: batches.length }
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelBatch(req, res, next) {
    try {
      const { batchId } = req.params;

      logger.info('Cancelling batch job', { batchId });

      const result = batchService.cancelBatchJob(batchId);

      res.json({
        success: true,
        data: result,
        message: 'Batch job cancelled'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBatch(req, res, next) {
    try {
      const { batchId } = req.params;

      logger.info('Deleting batch job', { batchId });

      const result = batchService.deleteBatchJob(batchId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
});
