import { ErrorResponses } from '../utils/errorResponse.js';
import { createPaginatedResponse } from '../middleware/pagination.js';

export const createAssetsController = ({ assetsService, logger }) => ({
  async listBackgrounds(req, res, next) {
    try {
      // Check if pagination is requested
      if (req.pagination) {
        const { limit, offset } = req.pagination;
        const result = await assetsService.listBackgrounds({ limit, offset });
        return res.json(createPaginatedResponse(result.items, result.total, req.pagination));
      }

      // Return all items (backwards compatibility)
      const backgrounds = await assetsService.listBackgrounds();
      res.json({
        success: true,
        data: backgrounds
      });
    } catch (error) {
      next(error);
    }
  },

  async importBackground(req, res, next) {
    try {
      if (!req.file) {
        return ErrorResponses.missingField(res, 'file');
      }

      logger.info('Importing background video', {
        filename: req.file.filename,
        size: req.file.size
      });

      const background = await assetsService.importBackground(req.file);

      res.json({
        success: true,
        data: background
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBackground(req, res, next) {
    try {
      const { id } = req.params;
      await assetsService.deleteBackground(id);

      res.json({
        success: true,
        message: 'Background deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getBackgroundInfo(req, res, next) {
    try {
      const { id } = req.params;
      const info = await assetsService.getBackgroundInfo(id);

      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  }
});
