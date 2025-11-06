import { Router } from 'express';

export const createMarketplaceRouter = ({ marketplaceController }) => {
  const router = Router();

  router.get('/templates', marketplaceController.listTemplates);
  router.get('/templates/:id', marketplaceController.getTemplate);
  router.post('/templates/:id/purchase', marketplaceController.purchaseTemplate);
  router.post('/templates/:id/rate', marketplaceController.rateTemplate);
  router.get('/purchases', marketplaceController.getUserPurchases);

  return router;
};
