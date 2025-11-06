/**
 * Batch Export Routes
 */

import { Router } from 'express';

export const createBatchExportRouter = ({ batchExportController }) => {
  const router = Router();

  router.post('/create', batchExportController.createJob);
  router.get('/list', batchExportController.listJobs);
  router.get('/:jobId', batchExportController.getJobStatus);
  router.post('/:jobId/cancel', batchExportController.cancelJob);
  router.post('/retry', batchExportController.retryJob);
  router.delete('/:jobId', batchExportController.deleteJob);

  return router;
};
