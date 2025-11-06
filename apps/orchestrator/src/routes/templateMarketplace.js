/**
 * Template Marketplace Routes
 */

import { Router } from 'express';

export const createTemplateMarketplaceRouter = ({ templateMarketplaceController }) => {
  const router = Router();

  router.get('/', templateMarketplaceController.browseTemplates);
  router.get('/featured', templateMarketplaceController.getFeatured);
  router.get('/search', templateMarketplaceController.searchTemplates);
  router.get('/:id', templateMarketplaceController.getTemplateById);
  router.post('/:id/purchase', templateMarketplaceController.purchaseTemplate);
  router.post('/:id/download', templateMarketplaceController.downloadTemplate);
  router.post('/:id/rate', templateMarketplaceController.rateTemplate);

  return router;
};
