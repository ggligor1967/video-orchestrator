import { logger } from './logger.js';
import os from 'os';

export class MemoryManager {
  static instance = null;
  
  constructor() {
    if (MemoryManager.instance) {
      return MemoryManager.instance;
    }
    
    this.watchers = new Set();
    this.thresholds = {
      warning: 70, // %
      critical: 85, // %
      emergency: 95 // %
    };
    
    MemoryManager.instance = this;
  }

  static getInstance() {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  addWatcher(callback) {
    this.watchers.add(callback);
  }

  removeWatcher(callback) {
    this.watchers.delete(callback);
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMem = os.totalmem();
    
    return {
      rss: usage.rss,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      percentage: (usage.rss / totalMem) * 100,
      totalSystem: totalMem
    };
  }

  checkMemoryPressure() {
    const usage = this.getMemoryUsage();
    const percentage = usage.percentage;
    
    let level = 'normal';
    if (percentage >= this.thresholds.emergency) {
      level = 'emergency';
    } else if (percentage >= this.thresholds.critical) {
      level = 'critical';
    } else if (percentage >= this.thresholds.warning) {
      level = 'warning';
    }

    if (level !== 'normal') {
      logger.warn('Memory pressure detected', {
        level,
        percentage: `${percentage.toFixed(2)}%`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
      });

      // Notify watchers
      for (const callback of this.watchers) {
        try {
          callback(level, usage);
        } catch (error) {
          logger.error('Memory watcher callback failed', { error: error.message });
        }
      }
    }

    return { level, usage };
  }

  forceGC() {
    if (global.gc) {
      const before = this.getMemoryUsage();
      global.gc();
      const after = this.getMemoryUsage();
      
      const freed = before.heapUsed - after.heapUsed;
      logger.info('Forced garbage collection', {
        freedMB: Math.round(freed / 1024 / 1024),
        beforeMB: Math.round(before.heapUsed / 1024 / 1024),
        afterMB: Math.round(after.heapUsed / 1024 / 1024)
      });
      
      return freed;
    }
    
    logger.warn('Garbage collection not available (run with --expose-gc)');
    return 0;
  }

  startMonitoring(interval = 30000) {
    if (this.monitoringInterval) {
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryPressure();
    }, interval);

    logger.info('Memory monitoring started', { 
      interval: `${interval / 1000}s`,
      thresholds: this.thresholds
    });
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Memory monitoring stopped');
    }
  }

  getRecommendations(usage) {
    const recommendations = [];
    const percentage = usage.percentage;

    if (percentage > 80) {
      recommendations.push({
        priority: 'high',
        action: 'Clear temporary files and caches',
        impact: 'Immediate memory reduction'
      });
    }

    if (usage.heapUsed / usage.heapTotal > 0.9) {
      recommendations.push({
        priority: 'high',
        action: 'Force garbage collection',
        impact: 'Free unused heap memory'
      });
    }

    if (percentage > 70) {
      recommendations.push({
        priority: 'medium',
        action: 'Reduce cache sizes and cleanup old data',
        impact: 'Prevent memory growth'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();