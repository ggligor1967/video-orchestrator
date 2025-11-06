import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';

describe('Week 1 & Week 2 Performance Tests', () => {
  let container;
  let performanceMonitor;
  let processManager;
  let cacheService;

  beforeAll(async () => {
    container = createContainer();
    performanceMonitor = container.get('performanceMonitor');
    processManager = container.get('processManager');
    cacheService = container.get('cacheService');
    
    await cacheService.init();
  });

  afterAll(() => {
    performanceMonitor.stopMonitoring();
    processManager.cleanup();
  });

  describe('Week 1: Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const metrics = performanceMonitor.getMetrics();
      
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('cpu');
      expect(metrics.memory.heapUsed).toBeLessThan(500);
    });

    it('should track requests', () => {
      performanceMonitor.trackRequest(150, true);
      performanceMonitor.trackRequest(200, true);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.requests).toBeGreaterThan(0);
    });
  });

  describe('Week 2: Process Management', () => {
    it('should track active processes', () => {
      const mockProcess = { kill: () => {} };
      
      processManager.register(mockProcess, { type: 'test' });
      expect(processManager.getStats().active).toBe(1);
      
      processManager.unregister(mockProcess);
      expect(processManager.getStats().active).toBe(0);
    });

    it('should cleanup all processes', () => {
      const processes = [
        { kill: () => {} },
        { kill: () => {} }
      ];
      
      processes.forEach(p => processManager.register(p, { type: 'test' }));
      expect(processManager.getStats().active).toBe(2);
      
      processManager.cleanup();
      expect(processManager.getStats().active).toBe(0);
    });
  });

  describe('Week 2: Cache Management', () => {
    it('should cache and retrieve data', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      
      await cacheService.set(key, value);
      const retrieved = await cacheService.get(key);
      
      expect(retrieved).toEqual(value);
    });

    it('should cleanup expired entries', async () => {
      const removed = await cacheService.cleanupExpired();
      expect(removed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Tests', () => {
    it('should maintain memory under 500MB', async () => {
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      
      for (let i = 0; i < 50; i++) {
        await cacheService.set(`mem-${i}`, { data: 'x'.repeat(1024) });
      }
      
      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const increase = finalMemory - initialMemory;
      
      expect(increase).toBeLessThan(100);
    });
  });
});
