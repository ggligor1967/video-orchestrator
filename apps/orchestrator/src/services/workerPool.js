import { Worker } from 'worker_threads';
import os from 'os';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

const MAX_WORKERS = Math.max(2, os.cpus().length - 1);
const WORKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const RETRY_ATTEMPTS = 3;
const PRIORITY_LEVELS = { HIGH: 0, NORMAL: 1, LOW: 2 };

/**
 * Advanced Worker Pool with:
 * - Priority queue management
 * - Worker reuse and warm pools
 * - Automatic retry with exponential backoff
 * - Resource monitoring and throttling
 * - Graceful shutdown with cleanup
 */
export class WorkerPool extends EventEmitter {
  constructor(workerScript, options = {}) {
    super();
    this.workerScript = workerScript;
    this.maxWorkers = options.maxWorkers || MAX_WORKERS;
    this.minWorkers = options.minWorkers || 0;
    this.reuseWorkers = options.reuseWorkers !== false;
    this.timeout = options.timeout || WORKER_TIMEOUT;
    
    // Worker management
    this.idleWorkers = [];
    this.busyWorkers = new Map();
    this.queue = [];
    
    // Statistics
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      retriedJobs: 0,
      totalExecutionTime: 0,
      workerCreations: 0,
      workerReuses: 0
    };

    // Initialize warm pool if requested
    if (this.minWorkers > 0) {
      this.warmUp().catch(err => logger.error('Worker pool warmup failed', { error: err.message }));
    }
  }

  /**
   * Pre-create minimum number of workers for faster job execution
   */
  async warmUp() {
    logger.info('Warming up worker pool', { minWorkers: this.minWorkers });
    const promises = [];
    for (let i = 0; i < this.minWorkers; i++) {
      promises.push(this.createWorker().then(worker => {
        this.idleWorkers.push(worker);
      }));
    }
    await Promise.all(promises);
    logger.info('Worker pool warmed up', { idleWorkers: this.idleWorkers.length });
  }

  /**
   * Execute a job with priority support and automatic retry
   */
  async execute(data, options = {}) {
    const priority = options.priority || PRIORITY_LEVELS.NORMAL;
    const retries = options.retries !== undefined ? options.retries : RETRY_ATTEMPTS;
    const timeout = options.timeout || this.timeout;

    this.stats.totalJobs++;

    return new Promise((resolve, reject) => {
      const job = {
        id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        data,
        priority,
        retries,
        maxRetries: retries,
        timeout,
        resolve,
        reject,
        startTime: null,
        attempts: 0
      };

      // Insert into priority queue
      this.enqueue(job);
      this.processQueue();
    });
  }

  /**
   * Insert job into priority queue maintaining priority order
   */
  enqueue(job) {
    const index = this.queue.findIndex(j => j.priority > job.priority);
    if (index === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(index, 0, job);
    }
  }

  /**
   * Process queued jobs with available workers
   */
  async processQueue() {
    while (this.queue.length > 0 && this.canStartNewJob()) {
      const job = this.queue.shift();
      await this.runJob(job);
    }
  }

  /**
   * Check if we can start a new job based on worker availability
   */
  canStartNewJob() {
    return this.idleWorkers.length > 0 || this.busyWorkers.size < this.maxWorkers;
  }

  /**
   * Run a single job with worker assignment
   */
  async runJob(job) {
    job.attempts++;
    job.startTime = Date.now();

    let worker;
    try {
      // Get or create worker
      if (this.idleWorkers.length > 0) {
        worker = this.idleWorkers.pop();
        this.stats.workerReuses++;
        logger.debug('Reusing idle worker', { jobId: job.id, idleCount: this.idleWorkers.length });
      } else {
        worker = await this.createWorker();
        this.stats.workerCreations++;
        logger.debug('Created new worker', { jobId: job.id, busyCount: this.busyWorkers.size });
      }

      this.busyWorkers.set(worker.threadId, { worker, job });

      // Execute with timeout
      const result = await this.executeWorker(worker, job);
      
      // Job completed successfully
      const executionTime = Date.now() - job.startTime;
      this.stats.completedJobs++;
      this.stats.totalExecutionTime += executionTime;

      logger.debug('Job completed', { 
        jobId: job.id, 
        executionTime, 
        attempts: job.attempts 
      });

      this.emit('jobComplete', { jobId: job.id, executionTime, attempts: job.attempts });
      job.resolve(result);

      // Return worker to pool or terminate
      this.releaseWorker(worker);

    } catch (error) {
      logger.warn('Job execution failed', { 
        jobId: job.id, 
        attempt: job.attempts, 
        error: error.message 
      });

      // Retry logic with exponential backoff
      if (job.retries > 0) {
        job.retries--;
        this.stats.retriedJobs++;
        
        const backoffDelay = Math.min(1000 * Math.pow(2, job.attempts - 1), 10000);
        logger.info('Retrying job', { 
          jobId: job.id, 
          attemptsLeft: job.retries, 
          backoffDelay 
        });

        setTimeout(() => {
          this.enqueue(job);
          this.processQueue();
        }, backoffDelay);
      } else {
        // Max retries exceeded
        this.stats.failedJobs++;
        this.emit('jobFailed', { jobId: job.id, error: error.message, attempts: job.attempts });
        job.reject(error);
      }

      // Clean up failed worker
      if (worker) {
        this.busyWorkers.delete(worker.threadId);
        await worker.terminate().catch(() => {});
      }
    }
  }

  /**
   * Create a new worker thread
   */
  async createWorker() {
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(this.workerScript);
        worker.once('online', () => resolve(worker));
        worker.once('error', reject);
        
        // Handle unexpected exits
        worker.once('exit', (code) => {
          if (code !== 0) {
            logger.error('Worker exited unexpectedly', { threadId: worker.threadId, code });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Execute job on worker with timeout protection
   */
  executeWorker(worker, job) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Job timeout after ${job.timeout}ms`));
        this.busyWorkers.delete(worker.threadId);
        worker.terminate().catch(() => {});
      }, job.timeout);

      worker.postMessage({ jobId: job.id, data: job.data });

      const messageHandler = (result) => {
        clearTimeout(timeoutId);
        worker.off('message', messageHandler);
        worker.off('error', errorHandler);
        resolve(result);
      };

      const errorHandler = (error) => {
        clearTimeout(timeoutId);
        worker.off('message', messageHandler);
        worker.off('error', errorHandler);
        reject(error);
      };

      worker.once('message', messageHandler);
      worker.once('error', errorHandler);
    });
  }

  /**
   * Release worker back to idle pool or terminate
   */
  releaseWorker(worker) {
    this.busyWorkers.delete(worker.threadId);
    
    if (this.reuseWorkers && this.idleWorkers.length < this.minWorkers) {
      this.idleWorkers.push(worker);
      logger.debug('Worker returned to pool', { 
        threadId: worker.threadId, 
        idleCount: this.idleWorkers.length 
      });
    } else {
      worker.terminate().catch(err => {
        logger.error('Worker termination failed', { error: err.message });
      });
    }
  }

  /**
   * Gracefully terminate all workers and clear queue
   */
  async terminate() {
    logger.info('Terminating worker pool', { 
      queuedJobs: this.queue.length, 
      busyWorkers: this.busyWorkers.size,
      idleWorkers: this.idleWorkers.length
    });

    // Clear queue and reject pending jobs
    this.queue.forEach(job => {
      job.reject(new Error('Worker pool terminated'));
    });
    this.queue = [];

    // Terminate all workers
    const terminatePromises = [];
    
    for (const { worker } of this.busyWorkers.values()) {
      terminatePromises.push(worker.terminate().catch(() => {}));
    }
    
    for (const worker of this.idleWorkers) {
      terminatePromises.push(worker.terminate().catch(() => {}));
    }

    await Promise.all(terminatePromises);
    
    this.busyWorkers.clear();
    this.idleWorkers = [];
    
    logger.info('Worker pool terminated');
  }

  /**
   * Get detailed worker pool statistics
   */
  getStats() {
    const avgExecutionTime = this.stats.completedJobs > 0 
      ? this.stats.totalExecutionTime / this.stats.completedJobs 
      : 0;

    return {
      workers: {
        max: this.maxWorkers,
        min: this.minWorkers,
        idle: this.idleWorkers.length,
        busy: this.busyWorkers.size,
        total: this.idleWorkers.length + this.busyWorkers.size
      },
      queue: {
        pending: this.queue.length,
        byPriority: {
          high: this.queue.filter(j => j.priority === PRIORITY_LEVELS.HIGH).length,
          normal: this.queue.filter(j => j.priority === PRIORITY_LEVELS.NORMAL).length,
          low: this.queue.filter(j => j.priority === PRIORITY_LEVELS.LOW).length
        }
      },
      jobs: {
        total: this.stats.totalJobs,
        completed: this.stats.completedJobs,
        failed: this.stats.failedJobs,
        retried: this.stats.retriedJobs,
        successRate: this.stats.totalJobs > 0 
          ? ((this.stats.completedJobs / this.stats.totalJobs) * 100).toFixed(2) + '%'
          : '0%'
      },
      performance: {
        avgExecutionTime: Math.round(avgExecutionTime),
        workerCreations: this.stats.workerCreations,
        workerReuses: this.stats.workerReuses,
        reuseRate: this.stats.workerCreations > 0
          ? ((this.stats.workerReuses / (this.stats.workerCreations + this.stats.workerReuses)) * 100).toFixed(2) + '%'
          : '0%'
      }
    };
  }

  /**
   * Get priority level constant
   */
  static get PRIORITY() {
    return PRIORITY_LEVELS;
  }
}
