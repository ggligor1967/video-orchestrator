import express from 'express';

export function createPerformanceRoutes(container) {
  const router = express.Router();
  const performanceMonitor = container.resolve('performanceMonitor');

  router.get('/metrics', (req, res) => {
    const metrics = performanceMonitor.getMetrics();
    res.json({ success: true, data: metrics });
  });

  router.post('/gc', (req, res) => {
    if (global.gc) {
      global.gc();
      res.json({ success: true, message: 'Garbage collection triggered' });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'GC not exposed. Run with --expose-gc flag' 
      });
    }
  });

  return router;
}
