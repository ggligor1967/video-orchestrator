export const createAnalyticsController = ({ analyticsService, logger }) => ({
  async trackEvent(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const { event, data } = req.body;

      if (!event) {
        return res.status(400).json({
          success: false,
          error: { message: 'event is required' }
        });
      }

      await analyticsService.trackEvent(userId, event, data);

      res.json({ success: true, message: 'Event tracked' });
    } catch (error) {
      logger.error('Failed to track event', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getDashboard(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const { period = '7d' } = req.query;

      const dashboard = await analyticsService.getDashboard(userId, period);

      res.json({ success: true, data: { dashboard } });
    } catch (error) {
      logger.error('Failed to get dashboard', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
});
