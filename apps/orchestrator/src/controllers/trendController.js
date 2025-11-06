export const createTrendController = ({ trendService }) => {
  return {
    async getTrendingTopics(req, res, next) {
      try {
        const { genre, region = 'US', limit = 10 } = req.query;
        
        if (!genre) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_GENRE',
              message: 'Genre parameter is required'
            }
          });
        }

        const trends = await trendService.getTrendingTopics(genre, region, Number.parseInt(limit));
        
        res.json({
          success: true,
          data: {
            trends,
            meta: {
              genre,
              region,
              limit: Number.parseInt(limit),
              count: trends.length,
              fetchedAt: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        next(error);
      }
    },

    async getTrendBasedScripts(req, res, next) {
      try {
        const { trends } = req.body;
        
        if (!trends || !Array.isArray(trends) || trends.length === 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_TRENDS',
              message: 'Valid trends array is required in request body'
            }
          });
        }

        const scripts = await trendService.suggestTrendBasedScripts(trends, req.userId);
        
        res.json({
          success: true,
          data: {
            scripts,
            meta: {
              count: scripts.length,
              generatedAt: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        next(error);
      }
    },

    async getOptimalPostingTime(req, res, next) {
      try {
        const { genre, region = 'US' } = req.query;
        
        if (!genre) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_GENRE',
              message: 'Genre parameter is required'
            }
          });
        }

        const optimalTime = await trendService.getOptimalPostingTime(genre, region);
        
        res.json({
          success: true,
          data: {
            optimalTime,
            genre,
            region
          }
        });
      } catch (error) {
        next(error);
      }
    },

    async getTrendAlerts(req, res, next) {
      try {
        const { preferences } = req.body;
        
        const alerts = await trendService.getTrendAlerts(req.userId, preferences);
        
        res.json({
          success: true,
          data: {
            alerts,
            meta: {
              count: alerts.length,
              userId: req.userId
            }
          }
        });
      } catch (error) {
        next(error);
      }
    }
  };
};