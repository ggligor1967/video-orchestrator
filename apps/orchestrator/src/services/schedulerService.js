import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import fs from 'fs/promises';
import { logger } from '../utils/logger.js';

// In-memory storage for scheduled posts
const scheduledPosts = new Map();
const cronJobs = new Map();

export const schedulerService = {
  async schedulePost({ videoPath, platforms, scheduledTime, caption, hashtags, config = {} }) {
    const postId = uuidv4();

    // Validate scheduled time
    const scheduleDate = new Date(scheduledTime);
    if (scheduleDate <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    // Validate video file exists
    try {
      await fs.access(videoPath);
    } catch (_error) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const post = {
      id: postId,
      videoPath,
      platforms: Array.isArray(platforms) ? platforms : [platforms],
      scheduledTime,
      caption: caption || '',
      hashtags: hashtags || [],
      config: {
        autoDelete: config.autoDelete || false,
        retryOnFailure: config.retryOnFailure !== false,
        maxRetries: config.maxRetries || 3,
        notifyOnSuccess: config.notifyOnSuccess !== false,
        notifyOnFailure: config.notifyOnFailure !== false
      },
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      attempts: 0,
      lastAttempt: null,
      error: null,
      results: {}
    };

    scheduledPosts.set(postId, post);

    // Schedule the cron job
    this.setupCronJob(postId, scheduleDate);

    logger.info('Post scheduled', {
      postId,
      platforms: post.platforms,
      scheduledTime,
      videoPath
    });

    return {
      postId,
      scheduledTime: post.scheduledTime,
      platforms: post.platforms,
      status: post.status
    };
  },

  setupCronJob(postId, scheduleDate) {
    // Convert to cron expression
    const cronExpression = this.dateToCron(scheduleDate);

    const job = cron.schedule(cronExpression, async () => {
      await this.executePost(postId);
      // Stop the cron job after execution
      job.stop();
      cronJobs.delete(postId);
    }, {
      timezone: 'Europe/Bucharest'
    });

    cronJobs.set(postId, job);

    logger.debug('Cron job created', { postId, cronExpression });
  },

  dateToCron(date) {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = '*'; // Any day of week

    return `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
  },

  async executePost(postId) {
    const post = scheduledPosts.get(postId);
    if (!post) {
      logger.error('Post not found for execution', { postId });
      return;
    }

    post.status = 'posting';
    post.attempts++;
    post.lastAttempt = new Date().toISOString();

    logger.info('Executing scheduled post', { postId, platforms: post.platforms });

    try {
      // Post to each platform
      const results = {};

      for (const platform of post.platforms) {
        try {
          const result = await this.postToPlatform(platform, post);
          results[platform] = {
            success: true,
            postUrl: result.postUrl,
            postedAt: new Date().toISOString()
          };
          logger.info(`Posted to ${platform}`, { postId, postUrl: result.postUrl });
        } catch (error) {
          results[platform] = {
            success: false,
            error: error.message,
            attemptedAt: new Date().toISOString()
          };
          logger.error(`Failed to post to ${platform}`, { postId, error: error.message });
        }
      }

      post.results = results;

      // Check if any platform succeeded
      const hasSuccess = Object.values(results).some(r => r.success);

      if (hasSuccess) {
        post.status = 'completed';
      } else if (post.config.retryOnFailure && post.attempts < post.config.maxRetries) {
        // Schedule retry
        post.status = 'scheduled';
        const retryDate = new Date(Date.now() + 15 * 60 * 1000); // Retry in 15 minutes
        this.setupCronJob(postId, retryDate);
        logger.info('Post will be retried', { postId, retryDate });
      } else {
        post.status = 'failed';
      }

    } catch (error) {
      post.status = 'failed';
      post.error = error.message;
      logger.error('Post execution failed', { postId, error: error.message });
    }
  },

  /**
   * Post video to social media platform
   * 
   * NOTE: Real implementation requires:
   * 1. OAuth2 authentication for each platform
   * 2. API client libraries and credentials
   * 3. Platform-specific video upload protocols
   * 
   * Setup Instructions:
   * 
   * TikTok:
   * - Register at https://developers.tiktok.com/
   * - Create app, get Client Key and Client Secret
   * - Implement OAuth2 flow: https://developers.tiktok.com/doc/login-kit-web
   * - Use Content Posting API: https://developers.tiktok.com/doc/content-posting-api-get-started
   * - Set env vars: TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_ACCESS_TOKEN
   * 
   * YouTube:
   * - Create project at https://console.cloud.google.com/
   * - Enable YouTube Data API v3
   * - Get OAuth2 credentials
   * - Install googleapis: npm install googleapis
   * - Set env vars: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN
   * 
   * Instagram:
   * - Create app at https://developers.facebook.com/
   * - Enable Instagram Graph API
   * - Get access tokens with instagram_content_publish permission
   * - Set env vars: INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN
   */
  async postToPlatform(platform, post) {
    // Check if platform credentials are configured
    const credentials = this.getPlatformCredentials(platform);
    if (!credentials.configured) {
      throw new Error(`${platform} API credentials not configured. Please set ${credentials.required.join(', ')} in your .env file. See documentation at ${credentials.docsUrl}`);
    }

    switch (platform.toLowerCase()) {
      case 'tiktok':
        return await this.postToTikTok(post, credentials);
      case 'youtube':
        return await this.postToYouTube(post, credentials);
      case 'instagram':
        return await this.postToInstagram(post, credentials);
      default:
        throw new Error(`Platform ${platform} not supported. Supported platforms: tiktok, youtube, instagram`);
    }
  },

  getPlatformCredentials(platform) {
    const configs = {
      tiktok: {
        configured: !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_ACCESS_TOKEN),
        required: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_ACCESS_TOKEN'],
        docsUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
        clientKey: process.env.TIKTOK_CLIENT_KEY,
        accessToken: process.env.TIKTOK_ACCESS_TOKEN
      },
      youtube: {
        configured: !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_REFRESH_TOKEN),
        required: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN'],
        docsUrl: 'https://developers.google.com/youtube/v3/guides/uploading_a_video',
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
        refreshToken: process.env.YOUTUBE_REFRESH_TOKEN
      },
      instagram: {
        configured: !!(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN),
        required: ['INSTAGRAM_USER_ID', 'INSTAGRAM_ACCESS_TOKEN'],
        docsUrl: 'https://developers.facebook.com/docs/instagram-api/guides/content-publishing',
        userId: process.env.INSTAGRAM_USER_ID,
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    };

    return configs[platform.toLowerCase()] || { configured: false, required: [], docsUrl: '' };
  },

  async postToTikTok(_post, _credentials) {
    // Real implementation would use TikTok Content Posting API
    // Example: https://developers.tiktok.com/doc/content-posting-api-media-upload
    throw new Error('TikTok posting not yet implemented. Requires TikTok Content Posting API integration.');
  },

  async postToYouTube(_post, _credentials) {
    // Real implementation would use YouTube Data API v3
    // Example with googleapis library
    throw new Error('YouTube posting not yet implemented. Requires YouTube Data API v3 integration.');
  },

  async postToInstagram(_post, _credentials) {
    // Real implementation would use Instagram Graph API
    // Example: POST /v18.0/{ig-user-id}/media with video_url
    throw new Error('Instagram posting not yet implemented. Requires Instagram Graph API integration.');
  },

  getScheduledPost(postId) {
    const post = scheduledPosts.get(postId);
    if (!post) {
      throw new Error(`Scheduled post ${postId} not found`);
    }

    return {
      id: post.id,
      videoPath: post.videoPath,
      platforms: post.platforms,
      scheduledTime: post.scheduledTime,
      caption: post.caption,
      hashtags: post.hashtags,
      status: post.status,
      attempts: post.attempts,
      lastAttempt: post.lastAttempt,
      results: post.results,
      error: post.error,
      createdAt: post.createdAt
    };
  },

  getAllScheduledPosts(filters = {}) {
    const { limit, offset, ...otherFilters } = filters;
    let posts = Array.from(scheduledPosts.values());

    // Filter by status
    if (otherFilters.status) {
      posts = posts.filter(p => p.status === otherFilters.status);
    }

    // Filter by platform
    if (otherFilters.platform) {
      posts = posts.filter(p => p.platforms.includes(otherFilters.platform));
    }

    // Sort by scheduled time
    posts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

    const mappedPosts = posts.map(post => ({
      id: post.id,
      platforms: post.platforms,
      scheduledTime: post.scheduledTime,
      status: post.status,
      attempts: post.attempts,
      createdAt: post.createdAt
    }));

    // Apply pagination if limit/offset provided
    if (typeof limit === 'number' && typeof offset === 'number') {
      const paginated = mappedPosts.slice(offset, offset + limit);
      return {
        items: paginated,
        total: mappedPosts.length
      };
    }

    // Return all items (backwards compatibility)
    return mappedPosts;
  },

  cancelScheduledPost(postId) {
    const post = scheduledPosts.get(postId);
    if (!post) {
      throw new Error(`Scheduled post ${postId} not found`);
    }

    if (post.status !== 'scheduled') {
      throw new Error(`Cannot cancel post with status: ${post.status}`);
    }

    // Stop cron job
    const job = cronJobs.get(postId);
    if (job) {
      job.stop();
      cronJobs.delete(postId);
    }

    post.status = 'cancelled';
    post.cancelledAt = new Date().toISOString();

    logger.info('Post cancelled', { postId });

    return this.getScheduledPost(postId);
  },

  deleteScheduledPost(postId) {
    const post = scheduledPosts.get(postId);
    if (!post) {
      throw new Error(`Scheduled post ${postId} not found`);
    }

    // Stop cron job if exists
    const job = cronJobs.get(postId);
    if (job) {
      job.stop();
      cronJobs.delete(postId);
    }

    scheduledPosts.delete(postId);

    logger.info('Post deleted', { postId });

    return { success: true, message: 'Post deleted' };
  },

  updateScheduledPost(postId, updates) {
    const post = scheduledPosts.get(postId);
    if (!post) {
      throw new Error(`Scheduled post ${postId} not found`);
    }

    if (post.status !== 'scheduled') {
      throw new Error(`Cannot update post with status: ${post.status}`);
    }

    // Update allowed fields
    if (updates.caption !== undefined) post.caption = updates.caption;
    if (updates.hashtags !== undefined) post.hashtags = updates.hashtags;
    if (updates.scheduledTime !== undefined) {
      const newScheduleDate = new Date(updates.scheduledTime);
      if (newScheduleDate <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      post.scheduledTime = updates.scheduledTime;

      // Reschedule cron job
      const job = cronJobs.get(postId);
      if (job) {
        job.stop();
        cronJobs.delete(postId);
      }
      this.setupCronJob(postId, newScheduleDate);
    }

    logger.info('Post updated', { postId, updates: Object.keys(updates) });

    return this.getScheduledPost(postId);
  },

  getUpcomingPosts(limit = 10) {
    const now = new Date();
    const upcoming = Array.from(scheduledPosts.values())
      .filter(p => p.status === 'scheduled' && new Date(p.scheduledTime) > now)
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
      .slice(0, limit);

    return upcoming.map(post => ({
      id: post.id,
      platforms: post.platforms,
      scheduledTime: post.scheduledTime,
      timeUntilPost: Math.round((new Date(post.scheduledTime) - now) / 1000), // seconds
      caption: post.caption ? post.caption.substring(0, 50) + '...' : ''
    }));
  }
};
