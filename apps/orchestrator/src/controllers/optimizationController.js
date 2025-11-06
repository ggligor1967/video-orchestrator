export const createOptimizationController = ({ optimizationService, logger }) => ({
  async optimizeForPlatform(req, res) {
    try {
      const { content, platform } = req.body;

      if (!content || !content.script) {
        return res.status(400).json({
          success: false,
          error: { message: 'content with script is required' }
        });
      }

      const optimized = await optimizationService.optimizeForPlatform(content, platform);

      res.json({ success: true, data: { optimized } });
    } catch (error) {
      logger.error('Optimization failed', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async optimizeMultiPlatform(req, res) {
    try {
      const { content } = req.body;

      if (!content || !content.script) {
        return res.status(400).json({
          success: false,
          error: { message: 'content with script is required' }
        });
      }

      const optimizations = await optimizationService.optimizeMultiPlatform(content);

      res.json({ success: true, data: { optimizations } });
    } catch (error) {
      logger.error('Multi-platform optimization failed', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getOptimalPostTime(req, res) {
    try {
      const { platform, timezone } = req.query;
      const times = optimizationService.getOptimalPostTime(platform, timezone);

      res.json({ success: true, data: { times } });
    } catch (error) {
      logger.error('Failed to get optimal post time', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
});
