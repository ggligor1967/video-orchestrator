import fs from 'fs/promises';
import path from 'path';

export class ErrorRecovery {
  constructor({ logger }) {
    this.logger = logger;
    this.retryLimits = {
      ai: 3,
      media: 2,
      network: 5,
      general: 3
    };
    this.checkpointsDir = process.env.CHECKPOINTS_DIR || './data/checkpoints';
  }

  async withRetry(operation, type = 'general') {
    const limit = this.retryLimits[type] || 3;
    let lastError;
    
    for (let attempt = 1; attempt <= limit; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          this.logger.info('Operation succeeded after retry', { 
            type, 
            attempt, 
            totalAttempts: limit 
          });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        this.logger.warn('Operation attempt failed', {
          type,
          attempt,
          totalAttempts: limit,
          error: error.message
        });
        
        if (attempt < limit) {
          await this.backoff(attempt);
        }
      }
    }
    
    this.logger.error('Operation failed after all retries', {
      type,
      attempts: limit,
      finalError: lastError.message
    });
    
    throw new Error(`Operation failed after ${limit} attempts: ${lastError.message}`);
  }

  async backoff(attempt) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    
    this.logger.debug('Backing off before retry', { 
      attempt, 
      delayMs: delay 
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async saveCheckpoint(jobId, stage, data) {
    try {
      await fs.mkdir(this.checkpointsDir, { recursive: true });
      
      const checkpoint = {
        jobId,
        stage,
        data,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      
      const checkpointPath = path.join(this.checkpointsDir, `${jobId}_${stage}.json`);
      await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
      
      this.logger.debug('Checkpoint saved', { jobId, stage, checkpointPath });
      
      return checkpoint;
    } catch (error) {
      this.logger.error('Failed to save checkpoint', { 
        jobId, 
        stage, 
        error: error.message 
      });
    }
  }

  async loadCheckpoints(jobId) {
    try {
      const files = await fs.readdir(this.checkpointsDir);
      const checkpointFiles = files.filter(f => f.startsWith(`${jobId}_`) && f.endsWith('.json'));
      
      const checkpoints = [];
      
      for (const file of checkpointFiles) {
        try {
          const content = await fs.readFile(path.join(this.checkpointsDir, file), 'utf8');
          const checkpoint = JSON.parse(content);
          checkpoints.push(checkpoint);
        } catch (error) {
          this.logger.warn('Failed to load checkpoint file', { file, error: error.message });
        }
      }
      
      // Sort by timestamp
      return checkpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      this.logger.error('Failed to load checkpoints', { jobId, error: error.message });
      return [];
    }
  }

  async recoverPartialWork(jobId) {
    try {
      const checkpoints = await this.loadCheckpoints(jobId);
      
      if (checkpoints.length === 0) {
        this.logger.info('No checkpoints found for recovery', { jobId });
        return null;
      }
      
      // Find last successful checkpoint
      const lastGood = checkpoints.reverse().find(cp => cp.status === 'success');
      
      if (lastGood) {
        this.logger.info('Recovery point found', { 
          jobId, 
          stage: lastGood.stage,
          timestamp: lastGood.timestamp 
        });
        
        return {
          resumeFrom: lastGood.stage,
          data: lastGood.data,
          checkpoint: lastGood
        };
      }
      
      this.logger.warn('No successful checkpoints found', { jobId });
      return null;
    } catch (error) {
      this.logger.error('Recovery failed', { jobId, error: error.message });
      return null;
    }
  }

  async cleanupCheckpoints(jobId) {
    try {
      const files = await fs.readdir(this.checkpointsDir);
      const checkpointFiles = files.filter(f => f.startsWith(`${jobId}_`));
      
      for (const file of checkpointFiles) {
        await fs.unlink(path.join(this.checkpointsDir, file));
      }
      
      this.logger.info('Checkpoints cleaned up', { jobId, count: checkpointFiles.length });
    } catch (error) {
      this.logger.error('Checkpoint cleanup failed', { jobId, error: error.message });
    }
  }

  async withCheckpoints(jobId, stages, operation) {
    for (const stage of stages) {
      try {
        // Check if we can recover from this stage
        const recovery = await this.recoverPartialWork(jobId);
        
        if (recovery && recovery.resumeFrom === stage) {
          this.logger.info('Resuming from checkpoint', { jobId, stage });
          continue;
        }
        
        // Execute stage
        const result = await operation(stage);
        
        // Save checkpoint on success
        await this.saveCheckpoint(jobId, stage, result);
        
      } catch (error) {
        this.logger.error('Stage failed', { jobId, stage, error: error.message });
        throw error;
      }
    }
  }

  getRetryConfig(type) {
    return {
      type,
      limit: this.retryLimits[type] || 3,
      backoffMultiplier: 2,
      maxDelay: 10000
    };
  }

  async isRecoverable(error) {
    // Determine if error is recoverable based on type
    const recoverableErrors = [
      'ECONNRESET',
      'ETIMEDOUT', 
      'ENOTFOUND',
      'ECONNREFUSED',
      'Rate limit exceeded',
      'Service temporarily unavailable'
    ];
    
    return recoverableErrors.some(pattern => 
      error.message.includes(pattern) || 
      error.code === pattern
    );
  }
}

// Factory function
export const createErrorRecovery = ({ logger }) => {
  return new ErrorRecovery({ logger });
};

// Legacy export
export const errorRecovery = new ErrorRecovery({ logger: console });