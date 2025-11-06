import express from 'express';
import { paginate } from '../middleware/pagination.js';

export const createSchedulerRouter = ({ schedulerController }) => {
  const router = express.Router();

  router.post('/', schedulerController.schedulePost);
  router.get('/', paginate(), schedulerController.getAllPosts);
  router.get('/upcoming', schedulerController.getUpcoming);
  router.get('/:postId', schedulerController.getPost);
  router.put('/:postId', schedulerController.updatePost);
  router.post('/:postId/cancel', schedulerController.cancelPost);
  router.delete('/:postId', schedulerController.deletePost);

  return router;
};
