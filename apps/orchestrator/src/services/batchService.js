import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';

export class BatchService extends EventEmitter {
  constructor({ logger, aiService, ttsService, videoService, subtitleService }) {
    super();
    this.logger = logger;
    this.aiService = aiService;
    this.ttsService = ttsService;
    this.videoService = videoService;
    this.subtitleService = subtitleService;
    
    this.queue = [];
    this.processing = false;
    this.workers = parseInt(process.env.BATCH_WORKERS) || 2;
    this.batches = new Map();
  }

  async addBatch(jobs) {
    const batch = {
      id: uuid(),
      jobs: jobs.map(job => ({
        ...job,
        id: uuid(),
        status: 'pending',
        progress: 0,
        error: null,
        result: null
      })),
      createdAt: new Date().toISOString(),
      status: 'queued',
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0
    };
    
    this.batches.set(batch.id, batch);
    this.queue.push(batch);
    
    this.logger.info('Batch added to queue', {
      batchId: batch.id,
      totalJobs: batch.totalJobs,
      workers: this.workers
    });
    
    this.startProcessing();
    return batch;
  }

  async startProcessing() {
    if (this.processing) return;
    this.processing = true;
    
    try {
      while (this.queue.length > 0) {
        const batch = this.queue.shift();
        await this.processBatch(batch);
      }
    } finally {
      this.processing = false;
    }
  }

  async processBatch(batch) {
    batch.status = 'processing';
    batch.startedAt = new Date().toISOString();
    
    this.logger.info('Processing batch', { batchId: batch.id });
    
    // Process jobs in parallel chunks
    const chunks = this.chunkArray(batch.jobs, this.workers);
    
    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(job => this.processJob(job, batch))
      );
    }
    
    batch.status = batch.failedJobs > 0 ? 'completed_with_errors' : 'completed';
    batch.completedAt = new Date().toISOString();
    
    this.logger.info('Batch completed', {
      batchId: batch.id,
      completed: batch.completedJobs,
      failed: batch.failedJobs
    });
    
    this.emit('batch:complete', batch);
  }

  async processJob(job, batch) {
    try {
      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      
      this.logger.info('Processing job', { jobId: job.id, batchId: batch.id });
      
      // Full pipeline for single video
      const script = await this.aiService.generateScript({
        topic: job.topic,
        genre: job.genre || 'horror'
      });
      this.updateProgress(job, 20);
      
      const voiceOver = await this.ttsService.generateVoiceOver(script.script, {
        voice: job.voice || 'en_US-amy-medium'
      });
      this.updateProgress(job, 40);
      
      const background = await this.videoService.processBackground(job.backgroundPath, {
        duration: 60,
        platform: job.platform || 'tiktok'
      });
      this.updateProgress(job, 60);
      
      const subtitles = await this.subtitleService.generateSubtitles(voiceOver.path, {
        language: 'en',
        format: 'srt'
      });
      this.updateProgress(job, 80);
      
      const finalVideo = await this.videoService.compositeVideo({
        background: background.path,
        audio: voiceOver.path,
        subtitles: subtitles.path,
        platform: job.platform || 'tiktok'
      });
      
      job.status = 'completed';
      job.result = finalVideo;
      job.completedAt = new Date().toISOString();
      this.updateProgress(job, 100);
      
      batch.completedJobs++;
      
      this.logger.info('Job completed successfully', { jobId: job.id });
      
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date().toISOString();
      batch.failedJobs++;
      
      this.logger.error('Job failed', { jobId: job.id, error: error.message });
    }
  }

  updateProgress(job, progress) {
    job.progress = progress;
    this.emit('job:progress', { jobId: job.id, progress });
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  getBatchStatus(batchId) {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const progress = batch.totalJobs > 0 
      ? Math.round(((batch.completedJobs + batch.failedJobs) / batch.totalJobs) * 100)
      : 0;

    return {
      id: batch.id,
      status: batch.status,
      totalJobs: batch.totalJobs,
      completedJobs: batch.completedJobs,
      failedJobs: batch.failedJobs,
      progress,
      createdAt: batch.createdAt,
      startedAt: batch.startedAt,
      completedAt: batch.completedAt,
      jobs: batch.jobs.map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        result: job.result ? { path: job.result.path } : null
      }))
    };
  }

  getAllBatches(options = {}) {
    const allBatches = Array.from(this.batches.values()).map(batch => ({
      id: batch.id,
      status: batch.status,
      totalJobs: batch.totalJobs,
      completedJobs: batch.completedJobs,
      failedJobs: batch.failedJobs,
      progress: batch.totalJobs > 0 
        ? Math.round(((batch.completedJobs + batch.failedJobs) / batch.totalJobs) * 100)
        : 0,
      createdAt: batch.createdAt,
      completedAt: batch.completedAt
    }));

    // If pagination options provided, return paginated result
    if (options.limit !== undefined || options.offset !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || allBatches.length;
      const items = allBatches.slice(offset, offset + limit);
      return { items, total: allBatches.length };
    }

    // Return all items for backwards compatibility
    return allBatches;
  }

  cancelBatch(batchId) {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    if (batch.status === 'completed' || batch.status === 'completed_with_errors') {
      throw new Error('Cannot cancel completed batch');
    }

    // Cancel pending jobs
    batch.jobs
      .filter(job => job.status === 'pending')
      .forEach(job => {
        job.status = 'cancelled';
        job.completedAt = new Date().toISOString();
      });

    batch.status = 'cancelled';
    batch.completedAt = new Date().toISOString();

    this.logger.info('Batch cancelled', { batchId });
    return this.getBatchStatus(batchId);
  }

  deleteBatch(batchId) {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    this.batches.delete(batchId);
    this.logger.info('Batch deleted', { batchId });
    
    return { success: true };
  }
}

// Factory function
export const createBatchService = ({ logger, aiService, ttsService, videoService, subtitleService }) => {
  return new BatchService({ logger, aiService, ttsService, videoService, subtitleService });
};

// Legacy export
export const batchService = {
  createBatchJob: async (params) => {
    const service = new BatchService({ 
      logger: console,
      aiService: { generateScript: () => ({ script: 'mock' }) },
      ttsService: { generateVoiceOver: () => ({ path: 'mock.wav' }) },
      videoService: { processBackground: () => ({ path: 'mock.mp4' }), compositeVideo: () => ({ path: 'final.mp4' }) },
      subtitleService: { generateSubtitles: () => ({ path: 'mock.srt' }) }
    });
    return service.addBatch(params.videos || []);
  }
};