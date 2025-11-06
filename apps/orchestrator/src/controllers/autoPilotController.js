/**
 * Auto-Pilot Controller
 */

export const createAutoPilotController = ({ autoPilotService, logger }) => {
  return {
    async createVideo(req, res) {
      try {
        const result = await autoPilotService.createVideo(req.body);
        return res.status(201).json(result);
      } catch (error) {
        logger.error('Auto-pilot video creation failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: { code: 'AUTOPILOT_FAILED', message: error.message }
        });
      }
    },

    async getJobStatus(req, res) {
      try {
        const result = autoPilotService.getJobStatus(req.params.jobId);
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Failed to get job status', { error: error.message });
        return res.status(500).json({
          success: false,
          error: { code: 'STATUS_FAILED', message: error.message }
        });
      }
    }
  };
};
