/**
 * Content Analyzer Routes
 * AI-powered content analysis and optimization endpoints
 */

import express from 'express';

export const createContentAnalyzerRouter = ({ contentAnalyzerController }) => {
  const router = express.Router();

  router.post('/script', contentAnalyzerController.analyzeScript);
  router.post('/video-context', contentAnalyzerController.analyzeVideoContext);
  router.post('/realtime-suggestions', contentAnalyzerController.getRealtimeSuggestions);

  return router;
};
