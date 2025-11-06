import { Router } from 'express';

export const createSubscriptionRouter = ({ subscriptionController }) => {
  const router = Router();

  router.get('/plans', subscriptionController.getPlans);
  router.get('/current', subscriptionController.getCurrentSubscription);
  router.get('/usage', subscriptionController.getUsage);
  router.post('/upgrade', subscriptionController.upgradePlan);

  return router;
};
