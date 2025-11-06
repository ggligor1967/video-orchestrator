import express from 'express';
import { validateDataPath } from '../middleware/validatePath.js';

export const createSubsRouter = ({ subsController }) => {
  const router = express.Router();
  router.post('/generate', validateDataPath, subsController.generateSubtitles);
  router.post('/format', validateDataPath, subsController.formatSubtitles);
  return router;
};
