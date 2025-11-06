export const createEnterpriseController = ({ 
  multilingualService, 
  socialMediaService, 
  collaborationService, 
  logger 
}) => ({
  // Multilingual
  async getSupportedLanguages(req, res) {
    try {
      const languages = multilingualService.getSupportedLanguages();
      res.json({ success: true, data: { languages } });
    } catch (error) {
      logger.error('Failed to get languages', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async generateMultilingual(req, res) {
    try {
      const { content, languages } = req.body;
      const results = await multilingualService.generateMultilingualContent(content, languages);
      res.json({ success: true, data: { results } });
    } catch (error) {
      logger.error('Failed to generate multilingual', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  // Social Media
  async schedulePost(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const post = await socialMediaService.schedulePost({ ...req.body, userId });
      res.json({ success: true, data: { post } });
    } catch (error) {
      logger.error('Failed to schedule post', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async publishPost(req, res) {
    try {
      const { postId } = req.params;
      const post = await socialMediaService.publishPost(postId);
      res.json({ success: true, data: { post } });
    } catch (error) {
      logger.error('Failed to publish post', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getScheduledPosts(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const posts = socialMediaService.getScheduledPosts(userId);
      res.json({ success: true, data: { posts } });
    } catch (error) {
      logger.error('Failed to get posts', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  // Collaboration
  async createProject(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const project = await collaborationService.createProject(userId, req.body);
      res.json({ success: true, data: { project } });
    } catch (error) {
      logger.error('Failed to create project', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async inviteMember(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const { projectId } = req.params;
      const { email, role } = req.body;
      const member = await collaborationService.inviteMember(projectId, userId, email, role);
      res.json({ success: true, data: { member } });
    } catch (error) {
      logger.error('Failed to invite member', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getProjectMembers(req, res) {
    try {
      const { projectId } = req.params;
      const members = collaborationService.getProjectMembers(projectId);
      res.json({ success: true, data: { members } });
    } catch (error) {
      logger.error('Failed to get members', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
});
