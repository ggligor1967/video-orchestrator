/**
 * AI Director Routes
 * Routes for AI-powered creative direction
 */

import express from 'express';

export const createAiDirectorRouter = ({ aiDirectorController }) => {
  const router = express.Router();

  /**
   * GET /ai-director/templates
   * Get available creative templates for each genre
   */
  router.get('/templates', aiDirectorController.getTemplates);

/**
 * POST /ai-director/direct
 * Get full AI direction for video creation
 * 
 * Body: {
 *   script: string (50-5000 chars),
 *   genre: 'horror' | 'mystery' | 'paranormal' | 'true-crime',
 *   preferences?: {
 *     backgroundId?: string,
 *     voiceId?: string,
 *     musicId?: string,
 *     subtitleStyle?: string
 *   },
 *   options?: {
 *     quality?: 'draft' | 'standard' | 'premium',
 *     speed?: 'fast' | 'balanced' | 'quality',
 *     autoExecute?: boolean
 *   }
 * }
 */
router.post('/direct', aiDirectorController.directVideo);

/**
 * POST /ai-director/analyze
 * Analyze script context without making full direction
 * 
 * Body: {
 *   script: string (50-5000 chars),
 *   genre: 'horror' | 'mystery' | 'paranormal' | 'true-crime',
 *   detailed?: boolean
 * }
 */
router.post('/analyze', aiDirectorController.analyzeContext);

/**
 * POST /ai-director/suggest
 * Get creative suggestions without pipeline configuration
 * 
 * Body: {
 *   script: string,
 *   genre: 'horror' | 'mystery' | 'paranormal' | 'true-crime'
 * }
 */
router.post('/suggest', aiDirectorController.getSuggestions);

/**
 * POST /ai-director/preview
 * Preview execution plan without executing
 * 
 * Body: {
 *   script: string,
 *   genre: 'horror' | 'mystery' | 'paranormal' | 'true-crime',
 *   preferences?: object
 * }
 */
  router.post('/preview', aiDirectorController.previewPlan);

  return router;
};
