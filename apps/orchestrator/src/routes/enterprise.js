import { Router } from 'express';

export const createEnterpriseRouter = ({ enterpriseController }) => {
  const router = Router();

  // Multilingual
  router.get('/languages', enterpriseController.getSupportedLanguages);
  router.post('/multilingual', enterpriseController.generateMultilingual);

  // Social Media
  router.post('/social/schedule', enterpriseController.schedulePost);
  router.post('/social/publish/:postId', enterpriseController.publishPost);
  router.get('/social/scheduled', enterpriseController.getScheduledPosts);

  // Collaboration
  router.post('/projects', enterpriseController.createProject);
  router.post('/projects/:projectId/invite', enterpriseController.inviteMember);
  router.get('/projects/:projectId/members', enterpriseController.getProjectMembers);

  return router;
};
