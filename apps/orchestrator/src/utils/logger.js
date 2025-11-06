import winston from 'winston';

/**
 * List of sensitive patterns to redact from logs
 * IMPORTANT: More specific patterns must come BEFORE generic patterns
 * to ensure correct matching and replacement
 */
const SENSITIVE_PATTERNS = [
  // Specific API key patterns (actual values) - MUST BE FIRST
  { pattern: /(sk|pk)_\w{20,}/g, replacement: '[API_KEY_REDACTED]' },
  { pattern: /AI[a-zA-Z0-9]{35,}/g, replacement: '[GEMINI_KEY_REDACTED]' },  // 35+ chars (real keys are ~37-39)
  { pattern: /ghp_[a-zA-Z0-9]{36,}/g, replacement: '[GITHUB_TOKEN_REDACTED]' },  // 36+ chars
  // amazonq-ignore-next-line
  
  // Generic API Keys and Tokens - AFTER specific patterns
  { pattern: /(api[_-]?key\s*[=:]\s*)([^\s,}]+)/gi, replacement: '$1[REDACTED]' },
  // Bearer token MUST be before generic authorization to match full token
  { pattern: /([bB]earer\s+)([^\s,}]+)/g, replacement: '$1[REDACTED]' },
  { pattern: /(authorization\s*[=:]\s*)([^\s,}]+)/gi, replacement: '$1[REDACTED]' },
  { pattern: /(token\s*[=:]\s*)([^\s,}]+)/gi, replacement: '$1[REDACTED]' },
  
  // Passwords and Secrets
  { pattern: /("password"\s*:\s*)['"]?([^'",}]+)['"]?/g, replacement: '$1"[REDACTED]"' },  // JSON format
  { pattern: /([pP]assword\s*[=:]\s*)['"]?([^'"\s,}]+)['"]?/g, replacement: '$1[REDACTED]' },  // Regular format
  { pattern: /("secret"\s*:\s*)['"]?([^'",}]+)['"]?/g, replacement: '$1"[REDACTED]"' },  // JSON format
  { pattern: /([sS]ecret\s*[=:]\s*)['"]?([^'"\s,}]+)['"]?/g, replacement: '$1[REDACTED]' },  // Regular format
  { pattern: /([cC]redentials?\s*[=:]\s*)['"]?([^'"\s,}]+)['"]?/g, replacement: '$1[REDACTED]' },
  
  // Email addresses - disabled by default to preserve user contact info in logs
  // Enable if GDPR/privacy compliance requires email redaction
  // { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' },
  
  // Credit card numbers (basic pattern)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CARD_REDACTED]' },
];
// amazonq-ignore-next-line

/**
 * Sanitize a log message by removing sensitive information
 * @param {string|object} message - Log message to sanitize
 * @returns {string|object} Sanitized message
 */
function sanitizeLogMessage(message) {
  // Handle different message types
  if (message === null || message === undefined) {
    return message;
  }
  
  // Handle objects (convert to JSON, sanitize, convert back)
  if (typeof message === 'object') {
    try {
      let jsonStr = JSON.stringify(message);
      jsonStr = sanitizeString(jsonStr);
      return JSON.parse(jsonStr);
    } catch (error) {
      // Log JSON error for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.warn('JSON sanitization failed:', error.message);
      }
      return sanitizeString(String(message));
    }
  }
  
  // Handle strings
  if (typeof message === 'string') {
    return sanitizeString(message);
  }
  
  // For other types, convert to string and sanitize
  return sanitizeString(String(message));
}

/**
 * Sanitize a string by applying all sensitive patterns
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  let sanitized = str;
  
  // Apply all sensitive patterns
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  
  // Additional protection: remove log injection attempts
  // Replace only dangerous control characters that could inject fake log entries
  sanitized = sanitized
    .replaceAll('\r\n', ' ') // Replace CRLF with spaces
    .replaceAll('\r', ' ')   // Replace CR with spaces
    .replaceAll('\n', ' ')   // Replace LF with spaces
    .replaceAll('\t', ' ')   // Replace tabs with spaces
    // eslint-disable-next-line no-control-regex
    .replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // Remove dangerous control chars (preserve DEL \x7F)
  
  return sanitized;
}

/**
 * Winston format for sanitizing logs
 */
const sanitizeFormat = winston.format((info) => {
  // Sanitize the main message
  if (info.message) {
    info.message = sanitizeLogMessage(info.message);
  }
  
  // Sanitize any additional metadata
  const keysToSanitize = ['error', 'data', 'body', 'headers', 'query', 'params'];
  for (const key of keysToSanitize) {
    if (info[key]) {
      info[key] = sanitizeLogMessage(info[key]);
    }
  }
  
  return info;
})();

// Export sanitization functions for testing
export { sanitizeLogMessage, sanitizeString };

export function createLogger({ level = 'info', env = 'development' } = {}) {
  const transports = [];
  
  // Use rotating file transport to prevent memory accumulation
  transports.push(
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB max file size
      maxFiles: 3, // Keep only 3 rotated files
      tailable: true
    }),
    new winston.transports.File({ 
      filename: 'combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB max file size
      maxFiles: 3, // Keep only 3 rotated files
      tailable: true
    })
  );

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      sanitizeFormat,                      // SECURITY: Sanitize sensitive data first
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'video-orchestrator' },
    transports
  });

  if (env !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  }

  return logger;
}

const defaultLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  env: process.env.NODE_ENV || 'development'
});

let currentLogger = defaultLogger;

export const logger = {
  info: (...args) => currentLogger?.info?.(...args),
  warn: (...args) => currentLogger?.warn?.(...args),
  error: (...args) => currentLogger?.error?.(...args),
  debug: (...args) => (currentLogger?.debug || currentLogger?.info)?.(...args)
};

export const setLogger = (nextLogger) => {
  currentLogger = nextLogger;
};
