/**
 * Template Marketplace Controller
 * API endpoints for template marketplace
 */

import { z } from 'zod';

const purchaseSchema = z.object({
  userId: z.string()
});

const rateSchema = z.object({
  userId: z.string(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional()
});

export const createTemplateMarketplaceController = ({ templateMarketplaceService, logger }) => {
  return {
    /**
     * GET /templates/marketplace
     */
    async browseTemplates(req, res) {
      try {
        const filters = {
          category: req.query.category,
          priceRange: req.query.priceRange ? JSON.parse(req.query.priceRange) : undefined,
          minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
          tags: req.query.tags ? req.query.tags.split(',') : undefined,
          sortBy: req.query.sortBy
        };

        const pagination = {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 12
        };

        const result = await templateMarketplaceService.browseTemplates(filters, pagination);
        
        res.json(result);
      } catch (error) {
        logger.error('Browse templates failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * GET /templates/marketplace/featured
     */
    async getFeatured(req, res) {
      try {
        const limit = parseInt(req.query.limit) || 6;
        const templates = await templateMarketplaceService.getFeaturedTemplates(limit);
        
        res.json({ templates });
      } catch (error) {
        logger.error('Get featured templates failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * GET /templates/marketplace/:id
     */
    async getTemplateById(req, res) {
      try {
        const template = await templateMarketplaceService.getTemplateById(req.params.id);
        
        res.json({ template });
      } catch (error) {
        logger.error('Get template by ID failed', { error: error.message });
        res.status(404).json({ error: error.message });
      }
    },

    /**
     * POST /templates/marketplace/:id/purchase
     */
    async purchaseTemplate(req, res) {
      try {
        const validated = purchaseSchema.parse(req.body);
        
        const purchase = await templateMarketplaceService.purchaseTemplate(
          req.params.id,
          validated.userId
        );
        
        res.json({ success: true, purchase });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        
        logger.error('Purchase template failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * POST /templates/marketplace/:id/download
     */
    async downloadTemplate(req, res) {
      try {
        const { userId } = req.body;
        
        if (!userId) {
          return res.status(400).json({ error: 'userId required' });
        }
        
        const download = await templateMarketplaceService.downloadTemplate(
          req.params.id,
          userId
        );
        
        res.json({ success: true, download });
      } catch (error) {
        logger.error('Download template failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * POST /templates/marketplace/:id/rate
     */
    async rateTemplate(req, res) {
      try {
        const validated = rateSchema.parse(req.body);
        
        const review = await templateMarketplaceService.rateTemplate(
          req.params.id,
          validated.userId,
          validated.rating,
          validated.reviewText
        );
        
        res.json({ success: true, review });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        
        logger.error('Rate template failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * GET /templates/marketplace/search
     */
    async searchTemplates(req, res) {
      try {
        const { q, category } = req.query;
        
        if (!q) {
          return res.status(400).json({ error: 'Search query required' });
        }
        
        const result = await templateMarketplaceService.searchTemplates(q, { category });
        
        res.json(result);
      } catch (error) {
        logger.error('Search templates failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    }
  };
};
