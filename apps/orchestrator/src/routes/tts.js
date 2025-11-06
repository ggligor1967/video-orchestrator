import express from 'express';
import { validateDataPath } from '../middleware/validatePath.js';

export const createTtsRouter = ({ ttsController }) => {
  const router = express.Router();
  router.post('/generate', validateDataPath, ttsController.generateSpeech);
  router.get('/voices', ttsController.listVoices);
  return router;
};
