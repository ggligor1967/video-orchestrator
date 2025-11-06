import express from 'express';
import { validateDataPath } from '../middleware/validatePath.js';

export const createAudioRouter = ({ audioController }) => {
  const router = express.Router();
  router.post('/normalize', validateDataPath, audioController.normalizeAudio);
  router.post('/mix', validateDataPath, audioController.mixAudio);
  router.get('/info', validateDataPath, audioController.getAudioInfo);
  return router;
};
