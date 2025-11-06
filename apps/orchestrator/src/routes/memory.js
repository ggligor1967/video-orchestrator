import { Router } from 'express';

export const createMemoryRoutes = (container) => {
  const router = Router();
  
  router.get('/status', (req, res) => {
    const memoryManager = container.resolve('memoryManager');
    const cacheService = container.resolve('cacheService');
    const memoryOptimizer = container.resolve('memoryOptimizer');
    
    const memoryUsage = memoryManager.getMemoryUsage();
    const cacheStats = cacheService.getStats();
    const optimizerStats = memoryOptimizer.getMemoryStats();
    
    res.json({
      success: true,
      data: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          percentage: `${memoryUsage.percentage.toFixed(2)}%`,
          level: memoryManager.checkMemoryPressure().level
        },
        cache: {
          entries: cacheStats.entries,
          size: `${Math.round(cacheStats.totalSize / 1024 / 1024)}MB`,
          hits: cacheStats.totalHits
        },
        system: optimizerStats.system,
        recommendations: memoryManager.getRecommendations(memoryUsage)
      }
    });
  });

  router.post('/cleanup', async (req, res) => {
    const memoryOptimizer = container.resolve('memoryOptimizer');
    
    try {
      await memoryOptimizer.performCleanup();
      res.json({ success: true, message: 'Cleanup completed' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/gc', (req, res) => {
    const memoryManager = container.resolve('memoryManager');
    const freed = memoryManager.forceGC();
    
    res.json({
      success: true,
      data: { freedMB: Math.round(freed / 1024 / 1024) }
    });
  });

  return router;
};