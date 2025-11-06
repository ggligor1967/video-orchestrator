/**
 * Content Analyzer Controller
 * Handles HTTP requests for AI-powered content analysis and optimization
 */

export const createContentAnalyzerController = ({ contentAnalyzerService, logger }) => {
  return {
    /**
     * POST /api/content-analyzer/script
     * Analyze script content
     */
    async analyzeScript(req, res) {
      try {
        const result = await contentAnalyzerService.analyzeScript(req.body);
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Script analysis failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: { code: 'ANALYSIS_FAILED', message: error.message }
        });
      }
    },

    /**
     * POST /api/content-analyzer/video-context
     * Analyze complete video context
     */
    async analyzeVideoContext(req, res) {
      try {
        const result = await contentAnalyzerService.analyzeVideoContext(req.body);
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Video context analysis failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: { code: 'CONTEXT_ANALYSIS_FAILED', message: error.message }
        });
      }
    },

    /**
     * POST /api/content-analyzer/realtime-suggestions
     * Get real-time optimization suggestions
     */
    async getRealtimeSuggestions(req, res) {
      try {
        const result = await contentAnalyzerService.getRealtimeSuggestions(req.body);
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Realtime suggestions failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: { code: 'SUGGESTIONS_FAILED', message: error.message }
        });
      }
    }
  };
};
