import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrendMonitoringService } from '../../src/services/trendMonitoringService.js';

describe('TrendMonitoringService', () => {
  let trendService;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };
    
    trendService = new TrendMonitoringService({ logger: mockLogger });
  });

  describe('getTrendingTopics', () => {
    it('should return trending topics for a given genre', async () => {
      const trends = await trendService.getTrendingTopics('horror');
      
      expect(trends).toBeInstanceOf(Array);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('keyword');
      expect(trends[0]).toHaveProperty('category', 'horror');
      expect(trends[0]).toHaveProperty('score');
    });

    it('should return different trends for different genres', async () => {
      const horrorTrends = await trendService.getTrendingTopics('horror');
      const mysteryTrends = await trendService.getTrendingTopics('mystery');
      
      expect(horrorTrends[0].category).toBe('horror');
      expect(mysteryTrends[0].category).toBe('mystery');
    });

    it('should limit the number of returned trends', async () => {
      const trends = await trendService.getTrendingTopics('horror', 'US', 1);
      
      expect(trends).toBeInstanceOf(Array);
      expect(trends.length).toBe(1);
    });
  });

  describe('suggestTrendBasedScripts', () => {
    it('should generate scripts based on trending topics', async () => {
      const mockTrends = [
        {
          id: 'test-1',
          keyword: 'test topic',
          category: 'horror',
          hashtags: ['#test', '#horror']
        }
      ];
      
      const scripts = await trendService.suggestTrendBasedScripts(mockTrends);
      
      expect(scripts).toBeInstanceOf(Array);
      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts[0]).toHaveProperty('topic', 'test topic');
      expect(scripts[0]).toHaveProperty('genre', 'horror');
      expect(scripts[0]).toHaveProperty('script');
      expect(scripts[0]).toHaveProperty('hooks');
      expect(scripts[0]).toHaveProperty('hashtags');
    });

    it('should handle empty trends array with fallback', async () => {
      // With graceful degradation, empty array returns fallback instead of throwing
      const result = await trendService.suggestTrendBasedScripts([]);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0); // Fallback returns empty array for empty input
    });
  });

  describe('getOptimalPostingTime', () => {
    it('should return optimal posting time for a genre', async () => {
      const time = await trendService.getOptimalPostingTime('horror');
      
      expect(time).toBeTypeOf('string');
      expect(time).toMatch(/\d{2}:\d{2}-\d{2}:\d{2}/);
    });

    it('should return default time for unknown genre', async () => {
      const time = await trendService.getOptimalPostingTime('unknown');
      
      expect(time).toBe('19:00-21:00');
    });
  });

  describe('getTrendAlerts', () => {
    it('should return trend alerts based on preferences', async () => {
      const preferences = {
        genres: { horror: true },
        region: 'US'
      };
      
      const alerts = await trendService.getTrendAlerts('user-123', preferences);
      
      expect(alerts).toBeInstanceOf(Array);
    });
  });
});