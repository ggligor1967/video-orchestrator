/**
 * Smart Asset Recommender Controller
 */

export const createSmartAssetRecommenderController = ({ smartAssetRecommenderService, logger }) => {
  return {
    async getRecommendations(req, res) {
      try {
        const result = await smartAssetRecommenderService.getRecommendations(req.body);
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Asset recommendations failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: { code: 'RECOMMENDATIONS_FAILED', message: error.message }
        });
      }
    }
  };
};
