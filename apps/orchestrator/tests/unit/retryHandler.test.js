import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff, RETRY_PRESETS, CircuitBreaker } from '../../src/utils/retryHandler.js';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should succeed on first attempt if operation succeeds', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const promise = retryWithBackoff(operation, {
      maxRetries: 3,
      baseDelay: 100
    });

    await promise;

    expect(operation).toHaveBeenCalledTimes(1);
    await expect(promise).resolves.toBe('success');
  });

  it('should retry on retryable errors', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation, {
      maxRetries: 3,
      baseDelay: 100,
      exponentialBase: 2
    });

    // Wait for first retry (100ms delay)
    await vi.advanceTimersByTimeAsync(100);
    
    // Wait for second retry (200ms delay)
    await vi.advanceTimersByTimeAsync(200);

    await expect(promise).resolves.toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw after exhausting all retries', async () => {
    const error = new Error('ETIMEDOUT');
    const operation = vi.fn().mockRejectedValue(error);

    const promise = retryWithBackoff(operation, {
      maxRetries: 2,
      baseDelay: 100
    });

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);

    await expect(promise).rejects.toThrow('ETIMEDOUT');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should not retry on non-retryable errors', async () => {
    const error = new Error('Invalid input');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(
      retryWithBackoff(operation, {
        maxRetries: 3,
        baseDelay: 100,
        retryableErrors: ['ETIMEDOUT']
      })
    ).rejects.toThrow('Invalid input');

    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable status codes', async () => {
    const error = new Error('Server error');
    error.status = 503;
    
    const operation = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation, {
      maxRetries: 2,
      baseDelay: 100,
      retryableStatusCodes: [503]
    });

    await vi.advanceTimersByTimeAsync(100);

    await expect(promise).resolves.toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should apply exponential backoff correctly', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation, {
      maxRetries: 3,
      baseDelay: 100,
      exponentialBase: 2,
      maxDelay: 500
    });

    // First retry: 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(operation).toHaveBeenCalledTimes(2);

    // Second retry: 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(200);
    expect(operation).toHaveBeenCalledTimes(3);

    await expect(promise).resolves.toBe('success');
  });

  it('should respect maxDelay cap', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation, {
      maxRetries: 2,
      baseDelay: 1000,
      exponentialBase: 10,
      maxDelay: 2000
    });

    // Should cap at maxDelay (2000) instead of 10000 (1000 * 10^1)
    await vi.advanceTimersByTimeAsync(2000);

    await expect(promise).resolves.toBe('success');
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation, {
      maxRetries: 2,
      baseDelay: 100,
      onRetry
    });

    await vi.advanceTimersByTimeAsync(100);

    await expect(promise).resolves.toBe('success');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), 100);
  });

  it('should use preset configurations correctly', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('rate_limit_exceeded'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation, RETRY_PRESETS.ai);

    await vi.advanceTimersByTimeAsync(600); // baseDelay from preset

    await expect(promise).resolves.toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('CircuitBreaker', () => {
  it('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker({ name: 'test' });
    const state = breaker.getState();
    
    expect(state.state).toBe('CLOSED');
    expect(state.failureCount).toBe(0);
  });

  it('should open after failure threshold', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 3,
      timeout: 1000
    });

    const operation = vi.fn().mockRejectedValue(new Error('Service error'));

    // Trigger failures
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(operation)).rejects.toThrow('Service error');
    }

    const state = breaker.getState();
    expect(state.state).toBe('OPEN');
    expect(state.failureCount).toBe(3);
  });

  it('should reject requests when OPEN', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2,
      timeout: 1000
    });

    const operation = vi.fn().mockRejectedValue(new Error('Service error'));

    // Trigger failures to open circuit
    await expect(breaker.execute(operation)).rejects.toThrow('Service error');
    await expect(breaker.execute(operation)).rejects.toThrow('Service error');

    // Circuit should now be OPEN
    expect(breaker.getState().state).toBe('OPEN');

    // Should reject without calling operation
    await expect(breaker.execute(operation)).rejects.toThrow('Circuit breaker test is OPEN');
    expect(operation).toHaveBeenCalledTimes(2); // Not called on third attempt
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    vi.useFakeTimers();

    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2,
      timeout: 1000
    });

    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Service error'))
      .mockRejectedValueOnce(new Error('Service error'))
      .mockResolvedValueOnce('success');

    // Open the circuit
    await expect(breaker.execute(operation)).rejects.toThrow('Service error');
    await expect(breaker.execute(operation)).rejects.toThrow('Service error');
    expect(breaker.getState().state).toBe('OPEN');

    // Wait for timeout
    vi.advanceTimersByTime(1000);

    // Should allow one attempt in HALF_OPEN
    await expect(breaker.execute(operation)).resolves.toBe('success');

    vi.useRealTimers();
  });

  it('should close after success threshold in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2,
      successThreshold: 2,
      timeout: 100
    });

    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Service error'))
      .mockRejectedValueOnce(new Error('Service error'))
      .mockResolvedValue('success');

    // Open the circuit
    await expect(breaker.execute(operation)).rejects.toThrow();
    await expect(breaker.execute(operation)).rejects.toThrow();

    // Wait for timeout and transition to HALF_OPEN
    await new Promise(resolve => setTimeout(resolve, 150));

    // Succeed twice to close circuit
    await expect(breaker.execute(operation)).resolves.toBe('success');
    expect(breaker.getState().state).toBe('HALF_OPEN');
    
    await expect(breaker.execute(operation)).resolves.toBe('success');
    expect(breaker.getState().state).toBe('CLOSED');
  });

  it('should reset manually', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2
    });

    const operation = vi.fn().mockRejectedValue(new Error('Service error'));

    // Open the circuit
    await expect(breaker.execute(operation)).rejects.toThrow();
    await expect(breaker.execute(operation)).rejects.toThrow();
    expect(breaker.getState().state).toBe('OPEN');

    // Manual reset
    breaker.reset();

    const state = breaker.getState();
    expect(state.state).toBe('CLOSED');
    expect(state.failureCount).toBe(0);
  });
});
