export const createMarketplaceController = ({ marketplaceService, logger }) => ({
  async listTemplates(req, res) {
    try {
      const { category, tier, minRating, search } = req.query;
      const templates = await marketplaceService.listMarketplaceTemplates({
        category,
        tier,
        minRating: minRating ? parseFloat(minRating) : undefined,
        search
      });

      res.json({ success: true, data: { templates, total: templates.length } });
    } catch (error) {
      logger.error('Failed to list marketplace templates', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await marketplaceService.templateService.getTemplateById(id);

      if (!template.marketplace?.listed) {
        return res.status(404).json({
          success: false,
          error: { message: 'Template not found in marketplace' }
        });
      }

      res.json({ success: true, data: { template } });
    } catch (error) {
      logger.error('Failed to get template', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async purchaseTemplate(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const { id } = req.params;

      const purchase = await marketplaceService.purchaseTemplate(userId, id);

      res.status(201).json({
        success: true,
        data: { purchase },
        message: 'Template purchased successfully'
      });
    } catch (error) {
      logger.error('Failed to purchase template', { error: error.message });
      const status = error.message.includes('already purchased') ? 409 : 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  },

  async rateTemplate(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const { id } = req.params;
      const { rating, review } = req.body;

      const marketplace = await marketplaceService.rateTemplate(userId, id, rating, review);

      res.json({
        success: true,
        data: { marketplace },
        message: 'Rating submitted successfully'
      });
    } catch (error) {
      logger.error('Failed to rate template', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getUserPurchases(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const purchases = await marketplaceService.getUserPurchases(userId);

      res.json({ success: true, data: { purchases, total: purchases.length } });
    } catch (error) {
      logger.error('Failed to get purchases', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
});
