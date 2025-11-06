import { Router } from 'express';

export const createAnalyticsRouter = ({ analyticsController }) => {
  const router = Router();

  router.post('/track', analyticsController.trackEvent);
  router.get('/dashboard', analyticsController.getDashboard);

  return router;
};
