import { Router } from 'express';

export const createVariationRouter = ({ variationController }) => {
  const router = Router();
  router.post('/generate', variationController.generateVariations);
  return router;
};
