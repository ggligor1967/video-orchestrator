import express from 'express';
import { paginate } from '../middleware/pagination.js';

export const createBatchRouter = ({ batchController }) => {
  const router = express.Router();

  router.post('/', batchController.createBatch);
  router.get('/', paginate(), batchController.getAllBatches);
  router.get('/:batchId', batchController.getBatchStatus);
  router.post('/:batchId/cancel', batchController.cancelBatch);
  router.delete('/:batchId', batchController.deleteBatch);

  return router;
};
