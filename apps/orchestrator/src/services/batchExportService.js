/**
 * Batch Export Service
 * Process multiple video exports in parallel with queue management
 */

import { v4 as uuidv4 } from 'uuid';

export class BatchExportService {
  constructor({ logger, exportService }) {
    this.logger = logger;
    this.exportService = exportService;
    this.jobs = new Map();
    this.maxConcurrent = 3; // Process 3 videos at once
  }

  /**
   * Create a new batch export job
   */
  async createBatchJob(videos, options = {}) {
    const {
      userId,
      priority = 'normal',
      notifyOnComplete = true
    } = options;

    const jobId = uuidv4();

    const job = {
      id: jobId,
      userId,
      priority,
      totalVideos: videos.length,
      completedVideos: 0,
      failedVideos: 0,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      videos: videos.map(v => ({
        videoId: v.videoId,
        format: v.format || 'mp4',
        preset: v.preset || '1080p',
        status: 'pending',
        progress: 0,
        error: null,
        attempts: 0
      })),
      notifyOnComplete
    };

    this.jobs.set(jobId, job);

    this.logger.info('Batch export job created', { 
      jobId, 
      totalVideos: videos.length,
      priority 
    });

    // Start processing immediately
    this.processBatchJob(jobId).catch(err => {
      this.logger.error('Batch job processing error', { jobId, error: err.message });
    });

    return job;
  }

  /**
   * Process batch job with parallel exports
   */
  async processBatchJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.status = 'processing';
    this.logger.info('Processing batch job', { jobId });

    const pendingVideos = job.videos.filter(v => v.status === 'pending');
    
    // Process in batches of maxConcurrent
    for (let i = 0; i < pendingVideos.length; i += this.maxConcurrent) {
      const batch = pendingVideos.slice(i, i + this.maxConcurrent);
      
      await Promise.all(
        batch.map(video => this.processVideo(jobId, video))
      );
    }

    // Update final job status
    const allCompleted = job.videos.every(v => v.status === 'completed');
    const anyFailed = job.videos.some(v => v.status === 'failed');

    if (allCompleted) {
      job.status = 'completed';
      job.progress = 100;
    } else if (anyFailed) {
      job.status = 'partial';
      job.progress = Math.round((job.completedVideos / job.totalVideos) * 100);
    }

    this.logger.info('Batch job finished', { 
      jobId, 
      status: job.status,
      completed: job.completedVideos,
      failed: job.failedVideos
    });

    return job;
  }

  /**
   * Process individual video in batch
   */
  async processVideo(jobId, video) {
    const job = this.jobs.get(jobId);
    
    video.status = 'processing';
    video.attempts += 1;

    this.logger.info('Processing video in batch', { 
      jobId, 
      videoId: video.videoId,
      attempt: video.attempts
    });

    try {
      // Simulate export process (replace with real exportService call)
      await this.simulateExport(video, (progress) => {
        video.progress = progress;
        this.updateJobProgress(jobId);
      });

      video.status = 'completed';
      video.progress = 100;
      job.completedVideos += 1;

      this.logger.info('Video export completed', { 
        jobId, 
        videoId: video.videoId 
      });
    } catch (error) {
      video.status = 'failed';
      video.error = error.message;
      job.failedVideos += 1;

      this.logger.error('Video export failed', { 
        jobId, 
        videoId: video.videoId,
        error: error.message,
        attempts: video.attempts
      });

      // Retry if under max attempts
      if (video.attempts < 3) {
        video.status = 'pending';
        this.logger.info('Scheduling retry', { videoId: video.videoId });
      }
    }

    this.updateJobProgress(jobId);
  }

  /**
   * Simulate export process with progress updates
   */
  async simulateExport(video, onProgress) {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  }

  /**
   * Update overall job progress
   */
  updateJobProgress(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const totalProgress = job.videos.reduce((sum, v) => sum + v.progress, 0);
    job.progress = Math.round(totalProgress / job.totalVideos);
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    return job;
  }

  /**
   * Cancel batch job
   */
  async cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status === 'completed') {
      throw new Error('Cannot cancel completed job');
    }

    job.status = 'cancelled';
    
    // Cancel pending videos
    job.videos.forEach(v => {
      if (v.status === 'pending' || v.status === 'processing') {
        v.status = 'cancelled';
      }
    });

    this.logger.info('Batch job cancelled', { jobId });

    return job;
  }

  /**
   * Retry failed exports in job
   */
  async retryFailedExports(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const failedVideos = job.videos.filter(v => v.status === 'failed');
    
    if (failedVideos.length === 0) {
      throw new Error('No failed exports to retry');
    }

    // Reset failed videos to pending
    failedVideos.forEach(v => {
      v.status = 'pending';
      v.error = null;
    });

    job.status = 'processing';
    job.failedVideos = 0;

    this.logger.info('Retrying failed exports', { 
      jobId, 
      count: failedVideos.length 
    });

    // Resume processing
    await this.processBatchJob(jobId);

    return job;
  }

  /**
   * Get all jobs for user
   */
  async getAllJobs(userId, filters = {}) {
    const { status, limit = 50 } = filters;

    let jobs = Array.from(this.jobs.values())
      .filter(j => j.userId === userId);

    if (status) {
      jobs = jobs.filter(j => j.status === status);
    }

    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return jobs.slice(0, limit);
  }

  /**
   * Delete completed job
   */
  async deleteJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status === 'processing') {
      throw new Error('Cannot delete job in progress');
    }

    this.jobs.delete(jobId);

    this.logger.info('Batch job deleted', { jobId });

    return { success: true };
  }
}
