import { Router } from 'express';

export const createOptimizationRouter = ({ optimizationController }) => {
  const router = Router();

  router.post('/platform', optimizationController.optimizeForPlatform);
  router.post('/multi-platform', optimizationController.optimizeMultiPlatform);
  router.get('/post-time', optimizationController.getOptimalPostTime);

  return router;
};
