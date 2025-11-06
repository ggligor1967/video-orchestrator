import express from 'express';

export const createAiRouter = ({ aiController }) => {
  const router = express.Router();
  router.post('/script', aiController.generateScript);
  router.post('/background-suggestions', aiController.backgroundSuggestions);
  router.post('/virality-score', aiController.calculateViralityScore);
  return router;
};
