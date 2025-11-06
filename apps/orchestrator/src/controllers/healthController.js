export const createHealthController = ({ healthService }) => ({
  getStatus(req, res) {
    try {
      const health = healthService.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        success: true,
        data: health
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Failed to retrieve health status'
        }
      });
    }
  }
});
