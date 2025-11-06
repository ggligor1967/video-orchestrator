/**
 * Smart Asset Recommender Routes
 */

import express from 'express';

export const createSmartAssetRecommenderRouter = ({ smartAssetRecommenderController }) => {
  const router = express.Router();
  router.post('/recommendations', smartAssetRecommenderController.getRecommendations);
  return router;
};
