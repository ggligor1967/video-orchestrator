/**
 * Batch Export Controller
 * API endpoints for batch video export
 */

import { z } from 'zod';

const createJobSchema = z.object({
  userId: z.string(),
  videos: z.array(z.object({
    videoId: z.string(),
    format: z.string().optional().default('mp4'),
    preset: z.string().optional().default('1080p')
  })).min(1),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  notifyOnComplete: z.boolean().optional().default(true)
});

export const createBatchExportController = ({ batchExportService, logger }) => {
  return {
    /**
     * POST /batch-export/create
     */
    async createJob(req, res) {
      try {
        const validated = createJobSchema.parse(req.body);
        
        const job = await batchExportService.createBatchJob(
          validated.videos,
          {
            userId: validated.userId,
            priority: validated.priority,
            notifyOnComplete: validated.notifyOnComplete
          }
        );
        
        res.json({ success: true, job });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        
        logger.error('Create batch job failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * GET /batch-export/:jobId
     */
    async getJobStatus(req, res) {
      try {
        const job = await batchExportService.getJobStatus(req.params.jobId);
        
        res.json({ job });
      } catch (error) {
        logger.error('Get job status failed', { error: error.message });
        res.status(404).json({ error: error.message });
      }
    },

    /**
     * POST /batch-export/:jobId/cancel
     */
    async cancelJob(req, res) {
      try {
        const job = await batchExportService.cancelJob(req.params.jobId);
        
        res.json({ success: true, job });
      } catch (error) {
        logger.error('Cancel job failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * GET /batch-export/list
     */
    async listJobs(req, res) {
      try {
        const { userId, status, limit } = req.query;
        
        if (!userId) {
          return res.status(400).json({ error: 'userId required' });
        }
        
        const jobs = await batchExportService.getAllJobs(userId, {
          status,
          limit: limit ? parseInt(limit) : undefined
        });
        
        res.json({ jobs, count: jobs.length });
      } catch (error) {
        logger.error('List jobs failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * POST /batch-export/retry
     */
    async retryJob(req, res) {
      try {
        const { jobId } = req.body;
        
        if (!jobId) {
          return res.status(400).json({ error: 'jobId required' });
        }
        
        const job = await batchExportService.retryFailedExports(jobId);
        
        res.json({ success: true, job });
      } catch (error) {
        logger.error('Retry job failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * DELETE /batch-export/:jobId
     */
    async deleteJob(req, res) {
      try {
        const result = await batchExportService.deleteJob(req.params.jobId);
        
        res.json(result);
      } catch (error) {
        logger.error('Delete job failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    }
  };
};
