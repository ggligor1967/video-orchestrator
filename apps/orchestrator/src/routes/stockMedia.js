import { Router } from 'express';

/**
 * Stock Media Routes
 *
 * /stock/search - Search for stock videos
 * /stock/suggestions - Get AI-powered suggestions
 * /stock/download - Download and cache a video
 * /stock/video/:videoId - Get video details
 * /stock/cache/stats - Get cache statistics
 * /stock/cache - Clear cache
 */
export const createStockMediaRoutes = (container) => {
  const router = Router();
  const { stockMediaController } = container;

  // Search stock videos
  router.get('/search', stockMediaController.searchVideos);

  // Get AI-powered suggestions
  router.post('/suggestions', stockMediaController.getSuggestions);

  // Download video
  router.post('/download', stockMediaController.downloadVideo);

  // Get video details
  router.get('/video/:videoId', stockMediaController.getVideoDetails);

  // Cache management
  router.get('/cache/stats', stockMediaController.getCacheStats);
  router.delete('/cache', stockMediaController.clearCache);

  return router;
};
