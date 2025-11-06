/**
 * Graceful Degradation Utility
 * 
 * Provides fallback mechanisms for optional services (TTS, Whisper, AI)
 * to ensure core functionality continues even when services are unavailable.
 */

import { logger } from './logger.js';

/**
 * Service availability status
 */
const serviceStatus = new Map();

/**
 * Time provider for testability (can be mocked in tests)
 */
let timeProvider = () => Date.now();

/**
 * Set custom time provider (for testing)
 * @param {Function} provider - Function that returns current time in ms
 */
export function setTimeProvider(provider) {
  timeProvider = provider;
}

/**
 * Reset time provider to default
 */
export function resetTimeProvider() {
  timeProvider = () => Date.now();
}

/**
 * Check if a service is available
 * 
 * @param {string} serviceName - Name of the service
 * @returns {boolean} - True if service is available
 */
export function isServiceAvailable(serviceName) {
  const status = serviceStatus.get(serviceName);
  if (!status) return true; // Assume available if never checked
  
  // Check if cooldown period has passed
  if (status.unavailableUntil && timeProvider() < status.unavailableUntil) {
    return false;
  }
  
  // If cooldown has expired, reset availability
  if (status.unavailableUntil && timeProvider() >= status.unavailableUntil) {
    status.available = true;
    status.unavailableUntil = null;
  }
  
  return status.available;
}

/**
 * Mark a service as unavailable
 * 
 * @param {string} serviceName - Name of the service
 * @param {number} cooldownMs - Milliseconds before trying again (default: 5 minutes)
 */
export function markServiceUnavailable(serviceName, cooldownMs = 5 * 60 * 1000) {
  const now = timeProvider();
  serviceStatus.set(serviceName, {
    available: false,
    unavailableUntil: now + cooldownMs,
    lastChecked: now
  });
  
  logger.warn(`Service marked unavailable: ${serviceName}`, {
    cooldownMs,
    retryAfter: new Date(now + cooldownMs).toISOString()
  });
}

/**
 * Mark a service as available
 * 
 * @param {string} serviceName - Name of the service
 */
export function markServiceAvailable(serviceName) {
  serviceStatus.set(serviceName, {
    available: true,
    unavailableUntil: null,
    lastChecked: timeProvider()
  });
  
  logger.info(`Service marked available: ${serviceName}`);
}

/**
 * Get status of all services
 * 
 * @returns {Object} - Service status map
 */
export function getServiceStatus() {
  const status = {};
  for (const [name, info] of serviceStatus.entries()) {
    status[name] = {
      ...info,
      canRetry: !info.unavailableUntil || timeProvider() >= info.unavailableUntil
    };
  }
  return status;
}

/**
 * Execute operation with graceful degradation
 * 
 * @param {string} serviceName - Service name
 * @param {Function} operation - Primary operation to try
 * @param {Function} fallback - Fallback operation if service unavailable
 * @param {Object} options - Configuration
 * @returns {Promise<any>} - Result from operation or fallback
 */
export async function withGracefulDegradation(serviceName, operation, fallback, options = {}) {
  const { required = false, cooldownMs = 5 * 60 * 1000 } = options;

  // Check if service is known to be unavailable
  if (!isServiceAvailable(serviceName)) {
    logger.info(`Service ${serviceName} unavailable, using fallback`, { required });
    
    if (required) {
      throw new Error(`Required service ${serviceName} is currently unavailable`);
    }
    
    return fallback ? await fallback() : null;
  }

  try {
    const result = await operation();
    markServiceAvailable(serviceName);
    return result;
  } catch (error) {
    logger.error(`Service ${serviceName} operation failed`, {
      error: error.message,
      code: error.code,
      required
    });

    // Mark service as unavailable for cooldown period
    markServiceUnavailable(serviceName, cooldownMs);

    // If service is required, throw error
    if (required) {
      throw error;
    }

    // Otherwise, use fallback
    logger.info(`Using fallback for ${serviceName}`);
    return fallback ? await fallback() : null;
  }
}

/**
 * TTS service fallback: silence or skip
 */
export async function ttsFallback(duration = 60) {
  logger.warn('TTS service unavailable, generating silent audio placeholder');
  
  return {
    success: false,
    fallback: true,
    message: 'TTS service unavailable. Please configure Piper or use external TTS.',
    audioPath: null,
    duration,
    sampleRate: 22050
  };
}

/**
 * Whisper service fallback: manual subtitles or empty SRT
 */
export async function whisperFallback() {
  logger.warn('Whisper service unavailable, returning empty subtitle template');
  
  return {
    success: false,
    fallback: true,
    message: 'Whisper service unavailable. Please configure Whisper or add subtitles manually.',
    subtitlePath: null,
    segments: []
  };
}

/**
 * AI service fallback: template or manual script
 */
export async function aiServiceFallback(topic, genre) {
  logger.warn('AI service unavailable, returning template script');
  
  return {
    success: false,
    fallback: true,
    message: 'AI service unavailable. Please configure OpenAI/Gemini API keys or write script manually.',
    script: `[Template Script]\n\nTopic: ${topic}\nGenre: ${genre}\n\nPlease write your custom script here. This is a placeholder because the AI service is currently unavailable.`,
    hooks: [
      `Start with an attention-grabbing hook about ${topic}...`,
      'Add a compelling question or statement...',
      'Create curiosity and intrigue...'
    ],
    hashtags: [
      `#${genre}`,
      `#${topic.replace(/\s+/g, '')}`,
      '#content',
      '#story',
      '#viral'
    ],
    metadata: {
      topic,
      genre,
      generatedAt: new Date().toISOString(),
      fallback: true
    }
  };
}

/**
 * Check service health with timeout
 * 
 * @param {string} serviceName - Service name
 * @param {Function} healthCheck - Health check function
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if healthy
 */
export async function checkServiceHealth(serviceName, healthCheck, timeout = 5000) {
  try {
    const result = await Promise.race([
      healthCheck(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), timeout)
      )
    ]);
    
    markServiceAvailable(serviceName);
    return result !== false;
  } catch (error) {
    logger.warn(`Service health check failed: ${serviceName}`, { error: error.message });
    markServiceUnavailable(serviceName);
    return false;
  }
}

/**
 * Service availability flags
 */
export const ServiceFlags = {
  TTS: 'tts',
  WHISPER: 'whisper',
  AI: 'ai',
  FFMPEG: 'ffmpeg',
  STOCK_MEDIA: 'stock-media'
};

export default {
  isServiceAvailable,
  markServiceAvailable,
  markServiceUnavailable,
  getServiceStatus,
  withGracefulDegradation,
  ttsFallback,
  whisperFallback,
  aiServiceFallback,
  checkServiceHealth,
  ServiceFlags
};
