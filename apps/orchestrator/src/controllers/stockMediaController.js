import { z } from 'zod';

// Stock media-specific schemas for API operations
const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  orientation: z.enum(['portrait', 'landscape', 'square']).optional().default('portrait'),
  size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
  perPage: z.number().int().min(1).max(50).optional().default(15),
  page: z.number().int().min(1).optional().default(1),
  minDuration: z.number().min(0).optional().default(5),
  maxDuration: z.number().min(0).max(300).optional().default(120)
});

const suggestionsSchema = z.object({
  script: z.string().min(20, 'Script must be at least 20 characters'),
  genre: z.enum(['horror', 'mystery', 'paranormal', 'true crime']).optional(),
  maxSuggestions: z.number().int().min(1).max(20).optional().default(10)
});

const downloadSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  videoUrl: z.string().url('Valid video URL is required'),
  quality: z.enum(['small', 'medium', 'large', 'hd']).optional().default('medium')
});

const videoDetailsSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required')
});

/**
 * Stock Media Controller
 *
 * Handles HTTP requests for stock media operations:
 * - Search videos from Pexels/Pixabay
 * - Download and cache videos
 * - Get AI-powered suggestions
 * - Manage cache
 */
export const createStockMediaController = ({ stockMediaService, logger }) => ({
  /**
   * Search for stock videos
   * GET /stock/search?query=haunted+house&orientation=portrait
   */
  async searchVideos(req, res, next) {
    try {
      const validatedData = searchSchema.parse({
        query: req.query.query,
        orientation: req.query.orientation,
        size: req.query.size,
        perPage: req.query.perPage ? parseInt(req.query.perPage) : undefined,
        page: req.query.page ? parseInt(req.query.page) : undefined,
        minDuration: req.query.minDuration ? parseFloat(req.query.minDuration) : undefined,
        maxDuration: req.query.maxDuration ? parseFloat(req.query.maxDuration) : undefined
      });

      logger.info('Stock video search request', {
        query: validatedData.query,
        orientation: validatedData.orientation,
        perPage: validatedData.perPage
      });

      const results = await stockMediaService.searchVideos(
        validatedData.query,
        validatedData
      );

      res.json({
        success: true,
        data: {
          results,
          query: validatedData.query,
          page: validatedData.page,
          perPage: validatedData.perPage,
          totalResults: results.length
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Get AI-powered video suggestions based on script
   * POST /stock/suggestions
   */
  async getSuggestions(req, res, next) {
    try {
      const validatedData = suggestionsSchema.parse(req.body);

      logger.info('Getting stock video suggestions', {
        scriptLength: validatedData.script.length,
        genre: validatedData.genre,
        maxSuggestions: validatedData.maxSuggestions
      });

      const suggestions = await stockMediaService.getSuggestionsForScript(
        validatedData.script,
        {
          genre: validatedData.genre,
          maxSuggestions: validatedData.maxSuggestions
        }
      );

      res.json({
        success: true,
        data: {
          suggestions,
          count: suggestions.length
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Download and cache a stock video
   * POST /stock/download
   */
  async downloadVideo(req, res, next) {
    try {
      const validatedData = downloadSchema.parse(req.body);

      logger.info('Stock video download request', {
        videoId: validatedData.videoId,
        quality: validatedData.quality
      });

      const localPath = await stockMediaService.downloadVideo(
        validatedData.videoUrl,
        validatedData.videoId,
        validatedData.quality
      );

      // Get relative path for client
      const relativePath = localPath.replace(process.cwd(), '').replace(/\\/g, '/');

      res.json({
        success: true,
        data: {
          videoId: validatedData.videoId,
          localPath: relativePath,
          quality: validatedData.quality
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Get video details by ID
   * GET /stock/video/:videoId
   */
  async getVideoDetails(req, res, next) {
    try {
      const validatedData = videoDetailsSchema.parse({
        videoId: req.params.videoId
      });

      logger.info('Get stock video details', {
        videoId: validatedData.videoId
      });

      const details = await stockMediaService.getVideoDetails(validatedData.videoId);

      res.json({
        success: true,
        data: details
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Get cache statistics
   * GET /stock/cache/stats
   */
  async getCacheStats(req, res, next) {
    try {
      logger.info('Get cache statistics');

      const stats = await stockMediaService.getCacheStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear cache
   * DELETE /stock/cache
   */
  async clearCache(req, res, next) {
    try {
      logger.info('Clear stock media cache');

      const result = await stockMediaService.clearCache();

      res.json({
        success: true,
        data: result,
        message: 'Cache cleared successfully'
      });

    } catch (error) {
      next(error);
    }
  }
});
