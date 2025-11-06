import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export class CleanupService {
  constructor({ config }) {
    this.config = config;
    this.maxAge = config.cleanup?.maxAge || 60 * 60 * 1000; // 1 hour (reduced)
    this.interval = config.cleanup?.interval || 5 * 60 * 1000; // 5 minutes
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.cleanupOldFiles();
    }, this.interval);
    
    logger.info('Cleanup service started', { 
      maxAge: `${this.maxAge / 1000 / 60}min`,
      interval: `${this.interval / 1000 / 60}min`
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Cleanup service stopped');
  }

  async cleanupOldFiles() {
    logger.info('Starting cleanup of old temporary files');
    
    const directories = [
      path.join(process.cwd(), 'data', 'cache'),
      path.join(process.cwd(), 'data', 'tts'),
      path.join(process.cwd(), 'data', 'subs'),
      path.join(process.cwd(), 'tmp', 'uploads')
    ];

    let totalCleaned = 0;

    for (const dir of directories) {
      try {
        const cleaned = await this.cleanDirectory(dir);
        totalCleaned += cleaned;
      } catch (error) {
        logger.error('Failed to clean directory', { 
          directory: dir, 
          error: error.message 
        });
      }
    }

    logger.info('Cleanup completed', { filesRemoved: totalCleaned });
    return totalCleaned;
  }

  async cleanDirectory(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      const now = Date.now();
      let cleaned = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        
        try {
          const stats = await fs.stat(filePath);
          const age = now - stats.mtimeMs;

          if (age > this.maxAge) {
            await fs.unlink(filePath);
            cleaned++;
            logger.debug('Removed old file', { file: filePath, age: Math.round(age / 1000 / 60) + 'min' });
          }
        } catch (error) {
          logger.warn('Failed to process file', { file: filePath, error: error.message });
        }
      }

      return cleaned;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.debug('Directory does not exist', { directory: dirPath });
        return 0;
      }
      throw error;
    }
  }
}
