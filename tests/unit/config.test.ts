import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../../apps/orchestrator/src/config/config.js';

const ORIGINAL_ENV = { ...process.env };

describe('loadConfig', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.CORS_ORIGINS;
    delete process.env.JSON_BODY_LIMIT;
    delete process.env.URLENCODED_BODY_LIMIT;
    delete process.env.APP_VERSION;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns defaults when env variables are not provided', () => {
    const config = loadConfig();

    expect(config.env).toBe('development');
    expect(config.isProduction).toBe(false);
    expect(config.port).toBe(4545);
    expect(config.host).toBe('127.0.0.1');
    expect(config.version).toBe('1.0.0');
    expect(config.cors.origin).toContain('http://localhost:5173');
    expect(config.bodyParser.jsonLimit).toBe('50mb');
    expect(config.directories.data).toMatch(/data$/);
  });

  it('honours environment overrides', () => {
    process.env.NODE_ENV = 'staging'; // Use non-production to test CORS override
    process.env.PORT = '8080';
    process.env.HOST = '0.0.0.0';
    process.env.CORS_ORIGINS = 'https://example.com, https://another.dev';
    process.env.JSON_BODY_LIMIT = '10mb';
    process.env.URLENCODED_BODY_LIMIT = '9mb';
    process.env.APP_VERSION = '2.3.4';

    const config = loadConfig();

    expect(config.env).toBe('staging');
    expect(config.isProduction).toBe(false); // staging is not production
    expect(config.port).toBe(8080);
    expect(config.host).toBe('0.0.0.0');
    expect(config.version).toBe('2.3.4');
    expect(config.cors.origin).toEqual(['https://example.com', 'https://another.dev']);
    expect(config.bodyParser.jsonLimit).toBe('10mb');
    expect(config.bodyParser.urlencodedLimit).toBe('9mb');
  });

  it('restricts CORS to Tauri in production mode', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGINS = 'https://example.com, https://another.dev'; // Should be ignored

    const config = loadConfig();

    expect(config.env).toBe('production');
    expect(config.isProduction).toBe(true);
    // Production mode ignores CORS_ORIGINS for security
    expect(config.cors.origin).toEqual(['tauri://localhost']);
  });
});
