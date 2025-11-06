import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorRecovery } from '../../../apps/orchestrator/src/utils/errorRecovery.js';

describe('ErrorRecovery', () => {
  let errorRecovery;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    errorRecovery = new ErrorRecovery({ logger: mockLogger });
  });

  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await errorRecovery.withRetry(operation, 'general');
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');
    
    const result = await errorRecovery.withRetry(operation, 'general');
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Operation attempt failed',
      expect.objectContaining({
        type: 'general',
        attempt: 1,
        totalAttempts: 3
      })
    );
  });

  it('should fail after max retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'));
    
    await expect(errorRecovery.withRetry(operation, 'general')).rejects.toThrow(
      'Operation failed after 3 attempts: Persistent failure'
    );
    
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should use correct retry limits for different types', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Failure'));
    
    // AI operations should retry 3 times
    await expect(errorRecovery.withRetry(operation, 'ai')).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(3);
    
    operation.mockClear();
    
    // Network operations should retry 5 times
    await expect(errorRecovery.withRetry(operation, 'network')).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(5);
  });

  it('should identify recoverable errors', async () => {
    const recoverableError = new Error('ECONNRESET');
    const nonRecoverableError = new Error('Invalid syntax');
    
    expect(await errorRecovery.isRecoverable(recoverableError)).toBe(true);
    expect(await errorRecovery.isRecoverable(nonRecoverableError)).toBe(false);
  });

  it('should get retry configuration', () => {
    const config = errorRecovery.getRetryConfig('ai');
    
    expect(config).toEqual({
      type: 'ai',
      limit: 3,
      backoffMultiplier: 2,
      maxDelay: 10000
    });
  });
});