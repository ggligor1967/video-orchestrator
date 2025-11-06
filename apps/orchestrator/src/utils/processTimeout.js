import { logger } from './logger.js';

/**
 * Process timeout utilities to prevent hanging operations
 */

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise} - Promise that rejects on timeout
 */
export function withTimeout(promise, timeoutMs, operationName = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        logger.error(`${operationName} timed out after ${timeoutMs}ms`);
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      // Clear timeout if promise resolves first
      promise.finally(() => clearTimeout(timeoutId));
    })
  ]);
}

/**
 * Default timeout values for different operation types (in milliseconds)
 */
export const TIMEOUTS = {
  AI_REQUEST: 30000,        // 30 seconds for AI API calls
  VIDEO_PROCESSING: 300000, // 5 minutes for video processing
  AUDIO_PROCESSING: 120000, // 2 minutes for audio processing
  TTS_GENERATION: 60000,    // 1 minute for TTS
  SUBTITLE_GENERATION: 120000, // 2 minutes for subtitle generation
  FILE_UPLOAD: 180000,      // 3 minutes for file uploads
  PIPELINE_STEP: 600000,    // 10 minutes per pipeline step
  TOTAL_PIPELINE: 1800000   // 30 minutes for complete pipeline
};

/**
 * Wrap an async function with timeout protection
 * @param {Function} fn - Async function to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name of the operation
 * @returns {Function} - Wrapped function with timeout
 */
export function withTimeoutWrapper(fn, timeoutMs, operationName) {
  return async (...args) => {
    return withTimeout(fn(...args), timeoutMs, operationName);
  };
}

/**
 * Create a timeout controller that can be cancelled
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name of the operation
 * @returns {Object} - Controller with promise and cancel function
 */
export function createTimeoutController(timeoutMs, operationName = 'Operation') {
  let timeoutId;
  
  const promise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      logger.error(`${operationName} timed out after ${timeoutMs}ms`);
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return {
    promise,
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
}

/**
 * Execute multiple promises with individual timeouts
 * @param {Array<{promise: Promise, timeout: number, name: string}>} operations
 * @returns {Promise<Array>} - Results array
 */
export async function executeWithTimeouts(operations) {
  return Promise.all(
    operations.map(({ promise, timeout, name }) => 
      withTimeout(promise, timeout, name)
    )
  );
}
