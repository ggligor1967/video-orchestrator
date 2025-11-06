import { cacheService } from './cacheService.js';
import { withGracefulDegradation, ServiceFlags } from '../utils/gracefulDegradation.js';
import { retryWithBackoff, RETRY_PRESETS } from '../utils/retryHandler.js';

// Trend sources configuration
const TREND_SOURCES = {
  MOCK: 'mock',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter'
};

// Mock trend data for development/testing
const MOCK_TRENDS = {
  horror: [
    {
      id: 'mock-horror-1',
      keyword: 'haunted house stories',
      category: 'horror',
      hashtags: ['#hauntedhouse', '#ghoststories', '#horror', '#paranormal'],
      score: 95,
      peakTime: '20:00-22:00',
      growthRate: 0.85,
      volume: 150000,
      source: 'mock'
    },
    {
      id: 'mock-horror-2',
      keyword: 'urban legends',
      category: 'horror',
      hashtags: ['#urbanlegends', '#creepypasta', '#scarystories', '#legend'],
      score: 88,
      peakTime: '19:00-21:00',
      growthRate: 0.78,
      volume: 120000,
      source: 'mock'
    }
  ],
  mystery: [
    {
      id: 'mock-mystery-1',
      keyword: 'unsolved cases',
      category: 'mystery',
      hashtags: ['#unsolved', '#mystery', '#detective', '#truecrime'],
      score: 92,
      peakTime: '18:00-20:00',
      growthRate: 0.82,
      volume: 135000,
      source: 'mock'
    }
  ],
  paranormal: [
    {
      id: 'mock-paranormal-1',
      keyword: 'ghost encounters',
      category: 'paranormal',
      hashtags: ['#ghostencounters', '#supernatural', '#paranormal', '#spiritworld'],
      score: 89,
      peakTime: '21:00-23:00',
      growthRate: 0.75,
      volume: 110000,
      source: 'mock'
    }
  ],
  'true-crime': [
    {
      id: 'mock-truecrime-1',
      keyword: 'cold cases',
      category: 'true-crime',
      hashtags: ['#coldcases', '#truecrime', '#investigation', '#justice'],
      score: 94,
      peakTime: '19:00-21:00',
      growthRate: 0.88,
      volume: 165000,
      source: 'mock'
    }
  ]
};

export class TrendMonitoringService {
  constructor({ logger: log }) {
    this.logger = log;
    this.trendSources = new Map();
    this.initializeSources();
  }

  initializeSources() {
    // For now, we'll use mock data
    // In production, integrate with real APIs:
    // - TikTok Creative Center API
    // - YouTube Analytics API
    // - Twitter API v2
    // - Google Trends API
    this.trendSources.set(TREND_SOURCES.MOCK, true);
    this.logger.info('Trend monitoring service initialized with mock data');
  }

  async getTrendingTopics(genre, region = 'US', limit = 10) {
    return withGracefulDegradation(
      ServiceFlags.TREND_MONITORING,
      async () => {
        // Check cache first
        const cacheKey = cacheService.generateKey('trends', { genre, region, limit });
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          this.logger.info('Trends retrieved from cache', { genre, region });
          return cached;
        }

        // Get trends from all sources
        const trends = await this.fetchTrendsFromAllSources(genre, region, limit);
        
        // Rank and deduplicate trends
        const rankedTrends = this.rankAndDeduplicateTrends(trends, limit);
        
        // Cache results for 30 minutes
        await cacheService.set(cacheKey, rankedTrends, { 
          type: 'trends', 
          genre, 
          region,
          ttl: 30 * 60 * 1000 // 30 minutes
        });

        this.logger.info('Trends fetched and cached', { 
          genre, 
          region, 
          count: rankedTrends.length 
        });

        return rankedTrends;
      },
      () => this.getFallbackTrends(genre, limit), // Fallback function
      { required: false }
    );
  }

  async fetchTrendsFromAllSources(genre, region, _limit) {
    const allTrends = [];
    
    // Fetch from mock source (development/testing)
    if (this.trendSources.has(TREND_SOURCES.MOCK)) {
      try {
        const mockTrends = await retryWithBackoff(
          () => this.fetchMockTrends(genre, region),
          { ...RETRY_PRESETS.api, operationName: 'Mock Trends Fetch' }
        );
        allTrends.push(...mockTrends);
      } catch (error) {
        this.logger.warn('Failed to fetch mock trends', { error: error.message });
      }
    }

    // In production, add real API integrations here:

    return allTrends;
  }

  async fetchMockTrends(genre, region) {
    this.logger.debug('Fetching mock trends', { genre, region });
    
    // Return mock data based on genre
    const trends = MOCK_TRENDS[genre] || MOCK_TRENDS.horror;
    
    // Add some variation based on region if needed
    return trends.map(trend => ({
      ...trend,
      region: region,
      fetchedAt: new Date().toISOString()
    }));
  }

  rankAndDeduplicateTrends(trends, limit) {
    // Deduplicate by keyword
    const uniqueTrends = [];
    const seenKeywords = new Set();
    
    for (const trend of trends) {
      if (!seenKeywords.has(trend.keyword.toLowerCase())) {
        seenKeywords.add(trend.keyword.toLowerCase());
        uniqueTrends.push(trend);
      }
    }
    
    // Rank by score (descending)
    uniqueTrends.sort((a, b) => b.score - a.score);
    
    // Apply limit
    return uniqueTrends.slice(0, limit);
  }

  getFallbackTrends(genre, limit) {
    this.logger.info('Using fallback trends', { genre });
    
    // Return static fallback data
    const fallbackTrends = [
      {
        id: 'fallback-1',
        keyword: `${genre} stories`,
        category: genre,
        hashtags: [`#${genre}`, '#trending', '#viral', '#content'],
        score: 75,
        peakTime: '19:00-21:00',
        growthRate: 0.7,
        volume: 50000,
        source: 'fallback',
        isFallback: true
      }
    ];
    
    return fallbackTrends.slice(0, limit);
  }

  async suggestTrendBasedScripts(trendingTopics, userId = null) {
    return withGracefulDegradation(
      ServiceFlags.TREND_MONITORING,
      async () => {
        if (!trendingTopics || trendingTopics.length === 0) {
          throw new Error('No trending topics provided');
        }

        const scripts = [];
        
        for (const topic of trendingTopics.slice(0, 5)) {
          try {
            // In a real implementation, this would call aiService to generate
            // scripts based on trending topics. For now, we'll return mock data.
            const script = {
              topic: topic.keyword,
              genre: topic.category,
              script: `This is a trending ${topic.category} video about ${topic.keyword}. Create engaging content around this topic for maximum virality.`,
              hooks: [
                `You won't believe what's trending about ${topic.keyword}...`,
                `The truth about ${topic.keyword} is shocking!`,
                `Why everyone's talking about ${topic.keyword} right now`
              ],
              hashtags: [...topic.hashtags, '#trending', '#viral', '#content'],
              metadata: {
                trendId: topic.id,
                trendScore: topic.score,
                optimalPostingTime: topic.peakTime,
                growthPotential: topic.growthRate,
                generatedAt: new Date().toISOString()
              }
            };
            
            scripts.push(script);
          } catch (error) {
            this.logger.warn('Failed to generate script for trend', { 
              trendId: topic.id, 
              error: error.message 
            });
          }
        }
        
        this.logger.info('Generated trend-based scripts', { 
          count: scripts.length,
          userId 
        });
        
        return scripts;
      },
      () => this.getFallbackTrendScripts(trendingTopics), // Fallback function
      { required: false }
    );
  }

  getFallbackTrendScripts(trendingTopics) {
    this.logger.info('Using fallback trend scripts');
    
    return trendingTopics.slice(0, 3).map(topic => ({
      topic: topic.keyword,
      genre: topic.category,
      script: `Create engaging ${topic.category} content about ${topic.keyword} following current trends.`,
      hooks: [
        `Trending now: ${topic.keyword}`,
        `What you need to know about ${topic.keyword}`,
        `The ${topic.keyword} phenomenon`
      ],
      hashtags: [...topic.hashtags.slice(0, 3), '#trending', '#content'],
      metadata: {
        trendId: topic.id,
        trendScore: topic.score,
        isFallback: true
      }
    }));
  }

  async getOptimalPostingTime(genre, _region = 'US') {
    // In a real implementation, this would analyze historical data
    // For now, return mock optimal times based on genre
    const optimalTimes = {
      horror: '20:00-22:00',
      mystery: '18:00-20:00',
      paranormal: '21:00-23:00',
      'true-crime': '19:00-21:00'
    };
    
    return optimalTimes[genre] || '19:00-21:00';
  }

  async getTrendAlerts(userId, preferences = {}) {
    // Check for new trending opportunities
    const alerts = [];
    
    for (const [genre, enabled] of Object.entries(preferences.genres || {})) {
      if (enabled) {
        const trends = await this.getTrendingTopics(genre, preferences.region || 'US', 3);
        
        for (const trend of trends) {
          if (trend.growthRate > 0.8) { // High growth rate
            alerts.push({
              id: `alert-${trend.id}`,
              type: 'TRENDING_OPPORTUNITY',
              title: `🔥 ${trend.keyword} is trending!`,
              message: `Create content about ${trend.keyword} now for maximum engagement`,
              trend: trend,
              priority: 'high',
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return alerts.sort((a, b) => b.priority.localeCompare(a.priority));
  }
}