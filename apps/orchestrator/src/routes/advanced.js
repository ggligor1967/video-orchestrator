import { Router } from 'express';

export const createAdvancedRouter = ({ advancedController }) => {
  const router = Router();

  // Cloud
  router.post('/cloud/deploy', advancedController.deployToCloud);
  router.get('/cloud/providers', advancedController.getCloudProviders);

  // SSO
  router.post('/sso/configure', advancedController.configureSSOProvider);
  router.post('/sso/authenticate', advancedController.authenticateSSO);

  // White-label
  router.post('/whitelabel/create', advancedController.createWhiteLabel);
  router.post('/whitelabel/domain', advancedController.configureCustomDomain);

  // ML Analytics
  router.post('/ml/predict-virality', advancedController.predictVirality);
  router.get('/ml/optimal-time', advancedController.predictOptimalTime);
  router.get('/ml/audience', advancedController.analyzeAudience);
  router.get('/ml/trends', advancedController.detectTrends);

  return router;
};
