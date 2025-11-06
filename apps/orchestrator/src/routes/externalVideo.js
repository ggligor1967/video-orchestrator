import express from 'express';
import { validateBody } from '../middleware/validateRequest.js';
import { validateDataPath } from '../middleware/validatePath.js';
import { processVideoSchema, batchProcessSchema, stockSearchSchema, smartResizeSchema } from '../schemas/externalVideoSchemas.js';

export function createExternalVideoRoutes(container) {
  const router = express.Router();
  const externalVideoService = container.resolve('externalVideoService');
  const logger = container.resolve('logger');

  router.post('/process', validateBody(processVideoSchema), validateDataPath, async (req, res) => {
    try {
      const { method, script, name, voiceId, aspectRatio, brandKit, backgroundPath, audioPath, subtitles, captionStyle, duration } = req.body;

      if (!method) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_METHOD', message: 'Processing method is required' }
        });
      }

      const result = await externalVideoService.processVideo({
        method,
        script,
        name,
        voiceId,
        aspectRatio,
        brandKit,
        backgroundPath,
        audioPath,
        subtitles,
        captionStyle,
        duration
      });

      return res.status(200).json({
        success: true,
        message: 'Video processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('External video processing failed', { error: error.message, ip: req.ip });
      return res.status(500).json({
        success: false,
        error: { code: 'PROCESSING_FAILED', message: 'Processing failed' }
      });
    }
  });

  router.post('/batch', validateBody(batchProcessSchema), validateDataPath, async (req, res) => {
    try {
      const { videos, method = 'kapwing' } = req.body;

      if (!videos || !Array.isArray(videos)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Videos array is required' }
        });
      }

      const results = await externalVideoService.batchProcess(videos, method);

      return res.status(200).json({
        success: true,
        message: 'Batch processing completed',
        data: { results, total: videos.length, successful: results.filter(r => r.success).length }
      });
    } catch (error) {
      logger.error('Batch processing failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'BATCH_FAILED', message: error.message }
      });
    }
  });

  router.get('/estimate/:method', async (req, res) => {
    try {
      const { method } = req.params;
      const estimate = await externalVideoService.getProcessingEstimate(method);

      return res.status(200).json({
        success: true,
        data: estimate
      });
    } catch (error) {
      logger.error('Failed to get estimate', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'ESTIMATE_FAILED', message: error.message }
      });
    }
  });

  router.post('/pictory/stock-search', validateBody(stockSearchSchema), async (req, res) => {
    try {
      const { query, count = 10 } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_QUERY', message: 'Search query is required' }
        });
      }

      const pictoryService = container.resolve('pictoryService');
      const results = await pictoryService.searchStockFootage(query, count);

      return res.status(200).json({
        success: true,
        data: { videos: results, count: results.length }
      });
    } catch (error) {
      logger.error('Stock footage search failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: error.message }
      });
    }
  });

  router.post('/kapwing/smart-resize', validateBody(smartResizeSchema), async (req, res) => {
    try {
      const { videoUrl, targetRatio = '9:16' } = req.body;

      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_VIDEO', message: 'Video URL is required' }
        });
      }

      const kapwingService = container.resolve('kapwingService');
      const jobId = await kapwingService.smartResize(videoUrl, targetRatio);

      return res.status(200).json({
        success: true,
        message: 'Smart resize started',
        data: { jobId }
      });
    } catch (error) {
      logger.error('Smart resize failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'RESIZE_FAILED', message: error.message }
      });
    }
  });

  return router;
}
