/**
 * Auto-Pilot Routes
 */

import express from 'express';

export const createAutoPilotRouter = ({ autoPilotController }) => {
  const router = express.Router();
  
  router.post('/create', autoPilotController.createVideo);
  router.get('/status/:jobId', autoPilotController.getJobStatus);
  
  return router;
};
