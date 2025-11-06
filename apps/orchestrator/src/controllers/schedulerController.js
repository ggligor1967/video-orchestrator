import { z } from 'zod';
import { createPaginatedResponse } from '../middleware/pagination.js';

// Scheduler-specific schemas for social media posting
const schedulePostSchema = z.object({
  videoPath: z.string().min(1, 'Video path is required'),
  platforms: z.array(z.enum(['tiktok', 'youtube', 'instagram', 'facebook'])).min(1, 'At least one platform is required'),
  scheduledTime: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Scheduled time must be a valid future date'),
  caption: z.string().max(2200).optional(),
  hashtags: z.array(z.string()).max(30).optional(),
  config: z.object({
    autoDelete: z.boolean().optional(),
    retryOnFailure: z.boolean().optional(),
    maxRetries: z.number().min(1).max(10).optional(),
    notifyOnSuccess: z.boolean().optional(),
    notifyOnFailure: z.boolean().optional()
  }).optional()
});

const updatePostSchema = z.object({
  caption: z.string().max(2200).optional(),
  hashtags: z.array(z.string()).max(30).optional(),
  scheduledTime: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Scheduled time must be a valid future date').optional()
});

export const createSchedulerController = ({ schedulerService, logger }) => ({
  async schedulePost(req, res, next) {
    try {
      const validatedData = schedulePostSchema.parse(req.body);

      logger.info('Scheduling post', {
        platforms: validatedData.platforms,
        scheduledTime: validatedData.scheduledTime
      });

      const result = await schedulerService.schedulePost(validatedData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Post scheduled successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getPost(req, res, next) {
    try {
      const { postId } = req.params;

      logger.info('Getting scheduled post', { postId });

      const post = schedulerService.getScheduledPost(postId);

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllPosts(req, res, next) {
    try {
      const { status, platform } = req.query;

      logger.info('Getting all scheduled posts', { status, platform });

      if (req.pagination) {
        const { limit, offset } = req.pagination;
        const result = schedulerService.getAllScheduledPosts({ status, platform, limit, offset });
        return res.json(createPaginatedResponse(result.items, result.total, req.pagination));
      }

      const posts = schedulerService.getAllScheduledPosts({ status, platform });

      res.json({
        success: true,
        data: { posts, total: posts.length }
      });
    } catch (error) {
      next(error);
    }
  },

  async getUpcoming(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      logger.info('Getting upcoming posts', { limit });

      const posts = schedulerService.getUpcomingPosts(limit);

      res.json({
        success: true,
        data: { posts, count: posts.length }
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelPost(req, res, next) {
    try {
      const { postId } = req.params;

      logger.info('Cancelling scheduled post', { postId });

      const result = schedulerService.cancelScheduledPost(postId);

      res.json({
        success: true,
        data: result,
        message: 'Post cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async deletePost(req, res, next) {
    try {
      const { postId } = req.params;

      logger.info('Deleting scheduled post', { postId });

      const result = schedulerService.deleteScheduledPost(postId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePost(req, res, next) {
    try {
      const { postId } = req.params;
      const validatedData = updatePostSchema.parse(req.body);

      logger.info('Updating scheduled post', { postId, updates: Object.keys(validatedData) });

      const result = schedulerService.updateScheduledPost(postId, validatedData);

      res.json({
        success: true,
        data: result,
        message: 'Post updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
});
