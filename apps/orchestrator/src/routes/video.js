import express from 'express';
import { validateDataPath } from '../middleware/validatePath.js';

export const createVideoRouter = ({ videoController }) => {
  const router = express.Router();
  router.post('/crop', validateDataPath, videoController.cropToVertical);
  router.post('/auto-reframe', validateDataPath, videoController.autoReframe);
  router.post('/speed-ramp', validateDataPath, videoController.applySpeedRamp);
  router.post('/merge-audio', validateDataPath, videoController.mergeWithAudio);
  router.get('/info', validateDataPath, videoController.getVideoInfo);
  return router;
};
