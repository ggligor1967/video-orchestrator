/**
 * Retry Handler Utility
 * 
 * Provides retry logic for external service calls (AI, TTS, Whisper, etc.)
 * with exponential backoff and configurable retry policies.
 */

import { logger } from './logger.js';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 600, // Start with 600ms (as per existing AI service pattern)
  maxDelay: 5000,
  exponentialBase: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EPIPE',
    'rate_limit_exceeded',
    'timeout'
  ],
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

/**
 * Retry an async operation with exponential backoff
 * 
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry configuration
 * @param {number} options.maxRetries - Maximum retry attempts
 * @param {number} options.baseDelay - Initial delay in milliseconds
 * @param {number} options.maxDelay - Maximum delay cap
 * @param {number} options.exponentialBase - Exponential multiplier
 * @param {string[]} options.retryableErrors - Error codes that should trigger retry
 * @param {number[]} options.retryableStatusCodes - HTTP status codes that should trigger retry
 * @param {Function} options.onRetry - Callback before each retry (attempt, error, delay)
 * @param {string} options.operationName - Name for logging
 * @returns {Promise<any>} - Result of successful operation
 * @throws {Error} - Last error if all retries exhausted
 */
export async function retryWithBackoff(operation, options = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const { maxRetries, baseDelay, maxDelay, exponentialBase, retryableErrors, retryableStatusCodes, onRetry, operationName } = config;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 0) {
        logger.info(`Operation succeeded after ${attempt} retries`, {
          operation: operationName || 'unknown',
          attempt
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryableError = retryableErrors.some(code => 
        error.code === code || 
        error.message?.toLowerCase().includes(code.toLowerCase())
      );
      
      const isRetryableStatus = error.status && retryableStatusCodes.includes(error.status);
      
      // Don't retry if not retryable or out of retries
      if ((!isRetryableError && !isRetryableStatus) || attempt === maxRetries) {
        logger.error('Operation failed after all retries', {
          operation: operationName || 'unknown',
          attempts: attempt + 1,
          error: error.message,
          code: error.code,
          status: error.status
        });
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(exponentialBase, attempt),
        maxDelay
      );
      
      logger.warn('Operation failed, retrying...', {
        operation: operationName || 'unknown',
        attempt: attempt + 1,
        maxRetries,
        nextRetryIn: `${delay}ms`,
        error: error.message,
        code: error.code,
        status: error.status
      });
      
      // Call retry callback if provided
      if (onRetry) {
        await onRetry(attempt + 1, error, delay);
      }
      
      // Wait before retry
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry configuration presets for different service types
 */
export const RETRY_PRESETS = {
  ai: {
    maxRetries: 3,
    baseDelay: 600,
    maxDelay: 5000,
    operationName: 'AI Service'
  },
  
  tts: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 4000,
    operationName: 'TTS Service'
  },
  
  whisper: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 4000,
    operationName: 'Whisper Service'
  },
  
  ffmpeg: {
    maxRetries: 1,
    baseDelay: 500,
    maxDelay: 1000,
    operationName: 'FFmpeg Processing'
  },
  
  external: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    operationName: 'External Service'
  }
};

/**
 * Helper to sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrap an async function with retry logic
 * 
 * @param {Function} fn - Async function to wrap
 * @param {Object} retryConfig - Retry configuration
 * @returns {Function} - Wrapped function with retry logic
 */
export function withRetry(fn, retryConfig = {}) {
  return async function(...args) {
    return retryWithBackoff(
      () => fn.apply(this, args),
      retryConfig
    );
  };
}

/**
 * Circuit breaker to prevent cascading failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minute
    this.name = options.name || 'CircuitBreaker';
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker ${this.name} is OPEN. Try again later.`);
      }
      
      // Try to recover
      this.state = 'HALF_OPEN';
      this.successCount = 0;
      logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        logger.info(`Circuit breaker ${this.name} recovered to CLOSED state`);
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.successCount = 0;
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      logger.error(`Circuit breaker ${this.name} opened after ${this.failureCount} failures`);
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    logger.info(`Circuit breaker ${this.name} manually reset`);
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }
}

export default {
  retryWithBackoff,
  withRetry,
  RETRY_PRESETS,
  CircuitBreaker
};
