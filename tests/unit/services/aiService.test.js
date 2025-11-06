import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService } from '../../../apps/orchestrator/src/services/aiService.js';

describe('AIService', () => {
  let aiService;
  let mockLogger;
  let mockCacheService;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    mockCacheService = {
      generateKey: vi.fn(() => 'test-key'),
      get: vi.fn(() => null),
      set: vi.fn()
    };

    aiService = new AIService({
      logger: mockLogger,
      cacheService: mockCacheService
    });
  });

  it('should generate script with mock response', async () => {
    const result = await aiService.generateScript({
      topic: 'haunted mansion',
      genre: 'horror',
      duration: 60
    });

    expect(result.script).toContain('haunted mansion');
    expect(result.hooks).toHaveLength(3);
    expect(result.hashtags).toHaveLength(10);
    expect(result.metadata.topic).toBe('haunted mansion');
    expect(result.metadata.genre).toBe('horror');
  });

  it('should use cache when available', async () => {
    const cachedResult = {
      script: 'Cached script',
      hooks: ['Hook 1', 'Hook 2', 'Hook 3'],
      hashtags: ['#cached']
    };

    mockCacheService.get.mockResolvedValue(cachedResult);

    const result = await aiService.generateScript({
      topic: 'test',
      genre: 'horror'
    });

    expect(result).toBe(cachedResult);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Script retrieved from cache',
      { topic: 'test', genre: 'horror' }
    );
  });

  it('should handle missing genre gracefully', async () => {
    const result = await aiService.generateScript({
      topic: 'test topic'
      // No genre specified
    });

    expect(result.script).toBeTruthy();
    expect(result.metadata.genre).toBe('horror'); // Default fallback
  });

  it('should generate mock response when no AI clients available', async () => {
    // AIService constructor sets clients to null when no API keys
    const result = await aiService.generateScript({
      topic: 'test',
      genre: 'mystery'
    });

    expect(result.script).toContain('test');
    expect(result.metadata.mock).toBe(true);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'No AI API keys configured - using mock responses'
    );
  });
});