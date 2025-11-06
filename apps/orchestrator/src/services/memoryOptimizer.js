import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';

export class MemoryOptimizer {
  constructor({ config, cacheService, cleanupService }) {
    this.config = config;
    this.cacheService = cacheService;
    this.cleanupService = cleanupService;
    this.memoryThreshold = config.memory?.threshold || 85; // %
    this.checkInterval = config.memory?.checkInterval || 30000; // 30s
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.checkInterval);
    
    logger.info('Memory optimizer started', { 
      threshold: `${this.memoryThreshold}%`,
      interval: `${this.checkInterval / 1000}s`
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Memory optimizer stopped');
  }

  async checkMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMem = os.totalmem();
    const memoryPercent = (usage.rss / totalMem) * 100;

    if (memoryPercent > this.memoryThreshold) {
      logger.warn('High memory usage detected', {
        usage: `${memoryPercent.toFixed(2)}%`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        threshold: `${this.memoryThreshold}%`
      });

      await this.performCleanup();
    }
  }

  async performCleanup() {
    logger.info('Starting emergency memory cleanup');
    
    try {
      const results = await Promise.allSettled([
        this.cleanupTempFiles(),
        this.optimizeCache(),
        this.forceGarbageCollection()
      ]);

      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        logger.error('Some cleanup operations failed', {
          failures: failures.map(f => f.reason?.message || f.reason)
        });
      }

      const successful = results.filter(r => r.status === 'fulfilled').length;
      logger.info('Memory cleanup completed', { 
        successful, 
        total: results.length,
        failed: failures.length
      });
    } catch (error) {
      logger.error('Critical error during cleanup', { error: error.message, stack: error.stack });
      // Don't re-throw in development to avoid crashing the server
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async cleanupTempFiles() {
    const directories = [
      path.join(process.cwd(), 'data', 'tts'),
      path.join(process.cwd(), 'data', 'subs'),
      path.join(process.cwd(), 'data', 'cache', 'temp')
    ];

    let totalCleaned = 0;
    for (const dir of directories) {
      try {
        const cleaned = await this.cleanOldFiles(dir, 1000 * 60 * 5); // 5 min
        totalCleaned += cleaned;
      } catch (error) {
        logger.error('Failed to cleanup directory', { dir, error: error.message });
      }
    }

    logger.info('Temp files cleaned', { files: totalCleaned });
    return totalCleaned;
  }

  async cleanOldFiles(dirPath, maxAge = 1000 * 60 * 60) { // 1 hour default
    try {
      const files = await fs.readdir(dirPath);
      const now = Date.now();
      let cleaned = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await fs.stat(filePath);
          if (now - stats.mtimeMs > maxAge) {
            await fs.unlink(filePath);
            cleaned++;
          }
        } catch (error) {
          // File might be in use, skip
        }
      }

      return cleaned;
    } catch (error) {
      return 0;
    }
  }

  async optimizeCache() {
    if (!this.cacheService) return;

    // Force cache quota enforcement
    await this.cacheService.enforceQuota();
    
    // Clean expired entries
    const removed = await this.cacheService.cleanupExpired();
    
    logger.info('Cache optimized', { entriesRemoved: removed });
    return removed;
  }

  forceGarbageCollection() {
    if (global.gc) {
      const before = process.memoryUsage();
      global.gc();
      const after = process.memoryUsage();
      const freed = before.heapUsed - after.heapUsed;
      logger.debug('Forced garbage collection', {
        freedMB: Math.round(freed / 1024 / 1024)
      });
      return freed;
    }
    return 0;
  }

  getMemoryStats() {
    const usage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      process: {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024)
      },
      system: {
        total: Math.round(totalMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        used: Math.round((totalMem - freeMem) / 1024 / 1024),
        processPercent: ((usage.rss / totalMem) * 100).toFixed(2)
      }
    };
  }
}