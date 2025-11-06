import { createTrendController } from '../controllers/trendController.js';

export const createTrendRoutes = (container) => {
  const router = require('express').Router();
  const trendController = createTrendController({
    trendService: container.resolve('trendMonitoringService')
  });

  /**
   * @route GET /trends/topics
   * @desc Get trending topics for a specific genre
   * @param {string} genre - Content genre (horror, mystery, paranormal, true-crime)
   * @param {string} region - Geographic region (default: US)
   * @param {number} limit - Number of trends to return (default: 10)
   * @returns {object} Trends data with metadata
   */
  router.get('/topics', trendController.getTrendingTopics);

  /**
   * @route POST /trends/scripts
   * @desc Generate scripts based on trending topics
   * @body {array} trends - Array of trend objects
   * @returns {object} Generated scripts with metadata
   */
  router.post('/scripts', trendController.getTrendBasedScripts);

  /**
   * @route GET /trends/optimal-time
   * @desc Get optimal posting time for a genre
   * @param {string} genre - Content genre
   * @param {string} region - Geographic region (default: US)
   * @returns {object} Optimal posting time information
   */
  router.get('/optimal-time', trendController.getOptimalPostingTime);

  /**
   * @route POST /trends/alerts
   * @desc Get trend alerts based on user preferences
   * @body {object} preferences - User trend preferences
   * @returns {object} Trend alerts
   */
  router.post('/alerts', trendController.getTrendAlerts);

  return router;
};