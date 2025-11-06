import express from 'express';
import { validateDataPath } from '../middleware/validatePath.js';

export const createExportRouter = ({ exportController }) => {
  const router = express.Router();
  router.post('/compile', validateDataPath, exportController.compileVideo);
  router.get('/presets', exportController.getExportPresets);
  return router;
};
