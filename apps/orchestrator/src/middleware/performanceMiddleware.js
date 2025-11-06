export function createPerformanceMiddleware(performanceMonitor) {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const success = res.statusCode < 400;
      performanceMonitor.trackRequest(duration, success);
      
      if (duration > 5000) {
        performanceMonitor.logger.warn('Slow request detected', {
          method: req.method,
          url: req.url,
          duration,
          statusCode: res.statusCode
        });
      }
    });
    
    next();
  };
}
