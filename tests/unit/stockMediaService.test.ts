import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockMediaService } from '../../apps/orchestrator/src/services/stockMediaService.js';

describe('StockMediaService', () => {
  let stockMediaService;
  let mockLogger;
  let mockConfig;
  let mockAiService;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    mockConfig = {
      PEXELS_API_KEY: 'test-pexels-key',
      PIXABAY_API_KEY: 'test-pixabay-key'
    };

    mockAiService = {
      analyzeScript: vi.fn()
    };

    stockMediaService = new StockMediaService({
      logger: mockLogger,
      config: mockConfig,
      aiService: mockAiService
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('API key validation', () => {
    it('has valid Pexels API key when provided', () => {
      expect(stockMediaService.pexelsApiKey).toBe('test-pexels-key');
    });

    it('has valid Pixabay API key when provided', () => {
      expect(stockMediaService.pixabayApiKey).toBe('test-pixabay-key');
    });

    it('handles missing API keys gracefully', () => {
      const serviceNoKeys = new StockMediaService({
        logger: mockLogger,
        config: {},
        aiService: mockAiService
      });

      expect(serviceNoKeys.pexelsApiKey).toBeUndefined();
      expect(serviceNoKeys.pixabayApiKey).toBeUndefined();
    });
  });

  describe('service initialization', () => {
    it('initializes with correct base URLs', () => {
      expect(stockMediaService.pexelsBaseUrl).toBe('https://api.pexels.com/videos');
      expect(stockMediaService.pixabayBaseUrl).toBe('https://pixabay.com/api/videos/');
    });

    it('sets up cache directory path', () => {
      expect(stockMediaService.cacheDir).toContain('data');
      expect(stockMediaService.cacheDir).toContain('cache');
      expect(stockMediaService.cacheDir).toContain('stock-videos');
    });
  });
});
