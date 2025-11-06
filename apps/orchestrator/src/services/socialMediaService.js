import { logger } from '../utils/logger.js';

const PLATFORMS = {
  tiktok: { name: 'TikTok', maxDuration: 60, apiEndpoint: 'https://api.tiktok.com' },
  youtube: { name: 'YouTube Shorts', maxDuration: 60, apiEndpoint: 'https://www.googleapis.com/youtube/v3' },
  instagram: { name: 'Instagram Reels', maxDuration: 90, apiEndpoint: 'https://graph.instagram.com' },
  facebook: { name: 'Facebook', maxDuration: 240, apiEndpoint: 'https://graph.facebook.com' }
};

export class SocialMediaService {
  constructor({ logger: log }) {
    this.logger = log;
    this.queue = [];
  }

  async schedulePost(post) {
    const scheduled = {
      id: `post-${Date.now()}`,
      ...post,
      status: 'scheduled',
      scheduledAt: post.scheduledAt || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.queue.push(scheduled);
    this.logger.info('Post scheduled', { id: scheduled.id, platforms: post.platforms });

    return scheduled;
  }

  async publishPost(postId) {
    const post = this.queue.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const results = {};
    for (const platform of post.platforms) {
      results[platform] = await this.publishToPlatform(post, platform);
    }

    post.status = 'published';
    post.publishedAt = new Date().toISOString();
    post.results = results;

    this.logger.info('Post published', { id: postId, platforms: post.platforms });
    return post;
  }

  async publishToPlatform(post, platform) {
    // Mock implementation - in production use real APIs
    return {
      platform,
      status: 'success',
      url: `https://${platform}.com/video/${Date.now()}`,
      publishedAt: new Date().toISOString()
    };
  }

  getScheduledPosts(userId) {
    return this.queue.filter(p => p.userId === userId && p.status === 'scheduled');
  }

  getSupportedPlatforms() {
    return Object.values(PLATFORMS);
  }
}
