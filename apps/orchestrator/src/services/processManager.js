export class ProcessManager {
  constructor({ logger }) {
    this.logger = logger;
    this.activeProcesses = new Set();
    this.processMetadata = new Map();
    
    this.setupCleanupHandlers();
  }

  setupCleanupHandlers() {
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  register(ffmpegCommand, metadata = {}) {
    this.activeProcesses.add(ffmpegCommand);
    this.processMetadata.set(ffmpegCommand, {
      ...metadata,
      startTime: Date.now()
    });
    
    this.logger.debug('Process registered', { 
      total: this.activeProcesses.size,
      type: metadata.type 
    });
  }

  unregister(ffmpegCommand) {
    const metadata = this.processMetadata.get(ffmpegCommand);
    this.activeProcesses.delete(ffmpegCommand);
    this.processMetadata.delete(ffmpegCommand);
    
    if (metadata) {
      const duration = Date.now() - metadata.startTime;
      this.logger.debug('Process unregistered', { 
        type: metadata.type,
        duration: `${duration}ms`,
        remaining: this.activeProcesses.size
      });
    }
  }

  async killProcess(ffmpegCommand) {
    try {
      if (ffmpegCommand && ffmpegCommand.kill) {
        ffmpegCommand.kill('SIGKILL');
      }
    } catch (error) {
      this.logger.warn('Failed to kill process', { error: error.message });
    }
  }

  cleanup() {
    this.logger.info('Cleaning up active processes', { count: this.activeProcesses.size });
    
    for (const process of this.activeProcesses) {
      this.killProcess(process);
    }
    
    this.activeProcesses.clear();
    this.processMetadata.clear();
  }

  getStats() {
    return {
      active: this.activeProcesses.size,
      processes: Array.from(this.processMetadata.values()).map(m => ({
        type: m.type,
        duration: Date.now() - m.startTime
      }))
    };
  }
}
