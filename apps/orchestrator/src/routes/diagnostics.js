import { Router } from 'express';

export const createDiagnosticsRouter = ({ memoryAnalyzer, memoryOptimizer, memoryManager }) => {
  const router = Router();

  router.get('/memory', (req, res) => {
    try {
      const summary = memoryAnalyzer.summary();
      const mm = memoryManager.getMemoryUsage();
      res.json({ success: true, data: { summary, manager: { rss: mm.rss, heapUsed: mm.heapUsed, percentage: Number(mm.percentage.toFixed(2)) } } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/snapshot', async (req, res) => {
    try {
      const label = req.body && req.body.label ? req.body.label : '';
      const result = await memoryAnalyzer.takeSnapshot(label);
      if (result.ok) return res.json({ success: true, path: result.path });
      return res.status(500).json({ success: false, error: result.error });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/cleanup', async (req, res) => {
    try {
      await memoryOptimizer.performCleanup();
      res.json({ success: true, message: 'Cleanup triggered' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/gc', (req, res) => {
    try {
      const freed = memoryManager.forceGC ? memoryManager.forceGC() : 0;
      res.json({ success: true, freed });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};

export default createDiagnosticsRouter;
