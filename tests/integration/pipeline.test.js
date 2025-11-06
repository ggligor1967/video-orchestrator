import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';

describe('End-to-End Pipeline', () => {
  let container;
  let pipelineService;
  let batchService;
  let performanceOptimizer;

  beforeAll(async () => {
    // Create container with test overrides
    container = createContainer({
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {}
      }
    });

    pipelineService = container.resolve('pipelineService');
    batchService = container.resolve('batchService');
    performanceOptimizer = container.resolve('performanceOptimizer');
  });

  afterAll(() => {
    // Cleanup
  });

  it('should generate complete video from topic', async () => {
    const job = {
      topic: 'haunted house',
      genre: 'horror',
      voice: 'en_US-amy-medium',
      platform: 'tiktok'
    };
    
    // Test full pipeline
    const result = await pipelineService.process(job);
    
    // Validations
    expect(result.status).toBe('completed');
    expect(result.outputPath).toBeTruthy();
    
    // Validate output video
    const validation = await performanceOptimizer.validateOutput(result.outputPath);
    expect(validation.valid).toBe(true);
    
    // Check all components
    expect(validation.checks.resolution).toBe(true);
    expect(validation.checks.aspectRatio).toBe(true);
    expect(validation.checks.fps).toBe(true);
    expect(validation.checks.duration).toBe(true);
  }, 60000);
  
  it('should handle errors gracefully', async () => {
    const job = {
      topic: '', // Invalid
      genre: 'invalid'
    };
    
    const result = await pipelineService.process(job);
    
    expect(result.status).toBe('failed');
    expect(result.error).toContain('validation');
  });
  
  it('should process batch efficiently', async () => {
    const jobs = Array(3).fill(null).map((_, i) => ({
      topic: `test topic ${i}`,
      genre: 'mystery',
      platform: 'youtube'
    }));
    
    const startTime = Date.now();
    const batch = await batchService.addBatch(jobs);
    
    // Wait for completion
    await waitForBatchCompletion(batch.id);
    
    const duration = Date.now() - startTime;
    
    // Should process in parallel (faster than sequential)
    expect(duration).toBeLessThan(jobs.length * 30000); // 30s per video max
    
    // Check batch status
    const status = batchService.getBatchStatus(batch.id);
    expect(status.completedJobs + status.failedJobs).toBe(jobs.length);
  }, 120000);

  async function waitForBatchCompletion(batchId, timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = batchService.getBatchStatus(batchId);
      
      if (status.status === 'completed' || status.status === 'completed_with_errors') {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Batch processing timeout');
  }
});