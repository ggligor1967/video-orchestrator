import express from 'express';
import { validateDataPath } from '../middleware/validatePath.js';

export const createPipelineRouter = ({ pipelineController }) => {
  const router = express.Router();
  router.post('/build', validateDataPath, pipelineController.buildVideo);
  router.get('/status/:jobId', pipelineController.getJobStatus);
  return router;
};
