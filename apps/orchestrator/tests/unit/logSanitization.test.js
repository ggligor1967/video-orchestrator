import { describe, it, expect } from 'vitest';
import { sanitizeLogMessage } from '../../src/utils/logger.js';

describe('Log Sanitization', () => {
  describe('API Key Sanitization', () => {
    it('should redact API keys with api_key pattern', () => {
      const message = 'User provided api_key=sk_test_1234567890abcdef';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[REDACTED]');
      expect(sanitized).not.toContain('sk_test_1234567890abcdef');
    });

    it('should redact Bearer tokens', () => {
      const message = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[REDACTED]');
      expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(sanitized).not.toContain('Bearer eyJ'); // Verify Bearer token part is gone
    });

    it('should redact OpenAI API keys (sk_ pattern)', () => {
      const message = 'Using key: sk_test_abcdefghijklmnopqrstuvwxyz123456';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toBe('Using key: [API_KEY_REDACTED]');
      expect(sanitized).not.toContain('sk_test_abcdefghijklmnopqrstuvwxyz123456');
    });

    it('should redact Gemini API keys (AI pattern)', () => {
      const message = 'Gemini key: AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345678901';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toBe('Gemini key: [GEMINI_KEY_REDACTED]');
      expect(sanitized).not.toContain('AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345678901');
    });

    it('should redact GitHub tokens (ghp_ pattern)', () => {
      const message = 'Token: ghp_1234567890abcdefghijklmnopqrstuvwxyz';
      const sanitized = sanitizeLogMessage(message);
      
      // Note: Generic "Token: " pattern catches this before ghp_ specific pattern
      // This is actually safer - doesn't reveal token type
      expect(sanitized).toBe('Token: [REDACTED]');
      expect(sanitized).not.toContain('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
      expect(sanitized).not.toContain('ghp_'); // Verify token is fully redacted
    });
  });

  describe('Password and Secret Sanitization', () => {
    it('should redact password fields', () => {
      const message = 'User login with password=SuperSecret123';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[REDACTED]');
      expect(sanitized).not.toContain('SuperSecret123');
    });

    it('should redact secret fields', () => {
      const message = 'Config loaded with secret="my-secret-value"';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[REDACTED]');
      expect(sanitized).not.toContain('my-secret-value');
    });

    it('should redact token fields', () => {
      const message = 'Session token: abc123xyz789';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[REDACTED]');
      expect(sanitized).not.toContain('abc123xyz789');
    });
  });

  describe('Credit Card Sanitization', () => {
    it('should redact credit card numbers', () => {
      const message = 'Payment with card 4532-1234-5678-9010';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[CARD_REDACTED]');
      expect(sanitized).not.toContain('4532-1234-5678-9010');
    });

    it('should redact credit card numbers without dashes', () => {
      const message = 'Card: 4532123456789010';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[CARD_REDACTED]');
      expect(sanitized).not.toContain('4532123456789010');
    });
  });

  describe('Log Injection Prevention', () => {
    it('should remove newline characters', () => {
      const message = 'User input\nFake log entry: ERROR';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).not.toContain('\n');
      expect(sanitized).toContain('User input Fake log entry: ERROR');
    });

    it('should remove carriage return characters', () => {
      const message = 'User input\rFake log entry';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).not.toContain('\r');
    });

    it('should remove tab characters', () => {
      const message = 'User input\tFake\tlog';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).not.toContain('\t');
      expect(sanitized).toContain('User input Fake log');
    });
  });

  describe('Object Sanitization', () => {
    it('should sanitize objects with sensitive fields', () => {
      const message = { 
        user: 'john', 
        password: 'secret123',
        apiKey: 'sk_test_abcdefghijklmnopqrst'
      };
      const sanitized = sanitizeLogMessage(message);
      
      const messageStr = JSON.stringify(sanitized);
      expect(messageStr).toContain('[REDACTED]');
      expect(messageStr).not.toContain('secret123');
      expect(messageStr).not.toContain('sk_test_');
    });
  });

  describe('Multiple Sensitive Data', () => {
    it('should redact multiple sensitive values in same message', () => {
      const message = 'Login: password=pass123, api_key=sk_test_xyz, token=abc123';
      const sanitized = sanitizeLogMessage(message);
      
      expect(sanitized).toContain('[REDACTED]');
      expect(sanitized).not.toContain('pass123');
      expect(sanitized).not.toContain('sk_test_xyz');
      expect(sanitized).not.toContain('abc123');
    });
  });

  describe('Safe Data Preservation', () => {
    it('should preserve non-sensitive data', () => {
      const message = 'User john@example.com logged in successfully from IP 192.168.1.1';
      const sanitized = sanitizeLogMessage(message);
      
      // Email and IP should be preserved
      expect(sanitized).toContain('john@example.com');
      expect(sanitized).toContain('192.168.1.1');
      expect(sanitized).toContain('logged in successfully');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const sanitized = sanitizeLogMessage(null);
      expect(sanitized).toBeNull();
    });

    it('should handle undefined values', () => {
      const sanitized = sanitizeLogMessage(undefined);
      expect(sanitized).toBeUndefined();
    });

    it('should handle empty strings', () => {
      const sanitized = sanitizeLogMessage('');
      expect(sanitized).toBe('');
    });

    it('should handle numbers', () => {
      const sanitized = sanitizeLogMessage(12345);
      expect(sanitized).toBe('12345');
    });
  });
});
