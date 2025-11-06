import { createContainer } from './container/index.js';
import { createApp } from './app.js';

const container = createContainer();
const app = createApp({ container });

const config = container.resolve('config');
const logger = container.resolve('logger');

// Only start server if not running under Vitest
// Vitest sets both VITEST=true and VITEST_WORKER_ID
// Tests will use supertest which doesn't need the server to listen
const isVitest = process.env.VITEST === 'true' || process.env.VITEST_WORKER_ID !== undefined;

if (!isVitest) {
  const server = app.listen(config.port, config.host, async () => {
    logger.info(`Video Orchestrator API server running on http://${config.host}:${config.port}`);
    logger.info(`CORS enabled for: ${config.cors.origin.join(', ')}`);
    logger.info('Static assets available at /static');
    
    // Initialize cache service
    const cacheService = container.resolve('cacheService');
    await cacheService.init();
    
    // Start background cleanup (runs every hour)
    const batchService = container.resolve('batchService');
    const pipelineService = container.resolve('pipelineService');
    const cleanupService = container.resolve('cleanupService');
    
    setInterval(async () => {
      try {
        let totalCleaned = 0;
        
        // Clean batch jobs
        if (typeof batchService.cleanupOldJobs === 'function') {
          const cleaned = batchService.cleanupOldJobs();
          totalCleaned += cleaned;
        }
        
        // Clean pipeline jobs
        if (typeof pipelineService.cleanupOldJobs === 'function') {
          const cleaned = pipelineService.cleanupOldJobs();
          totalCleaned += cleaned;
        }
        
        // Clean temporary files
        const filesRemoved = await cleanupService.cleanupOldFiles();
        totalCleaned += filesRemoved;
        
        // Enforce cache quota
        await cacheService.enforceQuota();
        
        if (totalCleaned > 0) {
          logger.info(`Completed periodic cleanup: removed ${totalCleaned} items`);
        }
      } catch (error) {
        logger.error('Cleanup failed', { error: error.message });
      }
    }, config.cleanup?.interval || 60 * 60 * 1000).unref(); // Run every hour by default
    
    logger.info('Background job cleanup scheduled', { 
      interval: `${(config.cleanup?.interval || 3600000) / 1000 / 60} minutes` 
    });
  });

  server.on('error', (error) => {
    logger.error(`Failed to start server: ${error.message}`, { error: error.stack });
    process.exit(1);
  });

  // Global error handlers to prevent silent crashes
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { 
      error: error.message, 
      stack: error.stack 
    });
    // Give time for logs to flush
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', { 
      reason: reason?.message || reason,
      promise: promise.toString()
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, starting graceful shutdown');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received (Ctrl+C), starting graceful shutdown');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

export default app;
