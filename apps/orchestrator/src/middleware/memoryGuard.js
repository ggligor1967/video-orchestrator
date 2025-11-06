import { memoryManager } from '../utils/memoryManager.js';

// Middleware that checks memory pressure and, when high, short-circuits heavy endpoints
export const createMemoryGuard = ({ logger, threshold = 90 }) => {
  // list of prefixes considered heavy
  const heavyPrefixes = ['/templates', '/batch-export', '/pipeline', '/marketplace', '/batch', '/external-video'];

  const middleware = (req, res, next) => {
    try {
      const usage = memoryManager.getMemoryUsage();
      const percent = usage.percentage;
      if (percent >= threshold) {
        // If request is heavy, short-circuit
        const isHeavy = heavyPrefixes.some((p) => req.path.startsWith(p));
        logger && logger.warn && logger.warn('MemoryGuard: High memory, throttling request', { path: req.path, percent: Number(percent.toFixed(2)) });
        if (isHeavy) {
          res.status(503).json({ success: false, error: 'Service temporarily unavailable due to high memory pressure' });
          return;
        }
        // Otherwise allow but mark header
        res.setHeader('X-Memory-Pressure', `${Number(percent.toFixed(2))}%`);
      }
    } catch (err) {
      // don't crash middleware
      logger && logger.error && logger.error('MemoryGuard middleware error', { error: err.message });
    }
    next();
  };

  return middleware;
};

export default createMemoryGuard;
