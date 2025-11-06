import { logger } from '../utils/logger.js';

export class AnalyticsService {
  constructor({ logger: log }) {
    this.logger = log;
    this.metrics = new Map();
  }

  async trackEvent(userId, event, data = {}) {
    const metric = {
      userId,
      event,
      data,
      timestamp: new Date().toISOString()
    };

    const key = `${userId}_${event}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key).push(metric);

    this.logger.info('Event tracked', { userId, event });
  }

  async getDashboard(userId, period = '7d') {
    const now = Date.now();
    const periodMs = this.parsePeriod(period);
    const startTime = now - periodMs;

    const userMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith(userId))
      .flatMap(([, events]) => events)
      .filter(e => new Date(e.timestamp).getTime() >= startTime);

    return {
      overview: this.calculateOverview(userMetrics),
      performance: this.calculatePerformance(userMetrics),
      engagement: this.calculateEngagement(userMetrics),
      trends: this.calculateTrends(userMetrics, periodMs),
      recommendations: this.generateRecommendations(userMetrics)
    };
  }

  calculateOverview(metrics) {
    const videosCreated = metrics.filter(m => m.event === 'video_created').length;
    const scriptsGenerated = metrics.filter(m => m.event === 'script_generated').length;
    const batchesProcessed = metrics.filter(m => m.event === 'batch_completed').length;

    return {
      videosCreated,
      scriptsGenerated,
      batchesProcessed,
      avgViralityScore: this.calculateAvgViralityScore(metrics),
      totalDuration: this.calculateTotalDuration(metrics)
    };
  }

  calculatePerformance(metrics) {
    const videoMetrics = metrics.filter(m => m.event === 'video_created');
    
    return {
      avgProcessingTime: this.calculateAvgProcessingTime(videoMetrics),
      successRate: this.calculateSuccessRate(metrics),
      cacheHitRate: this.calculateCacheHitRate(metrics),
      platformDistribution: this.calculatePlatformDistribution(videoMetrics)
    };
  }

  calculateEngagement(metrics) {
    const viralityScores = metrics
      .filter(m => m.data?.viralityScore)
      .map(m => m.data.viralityScore);

    return {
      avgViralityScore: viralityScores.length > 0 
        ? viralityScores.reduce((a, b) => a + b, 0) / viralityScores.length 
        : 0,
      highPerformingVideos: viralityScores.filter(s => s >= 80).length,
      mediumPerformingVideos: viralityScores.filter(s => s >= 50 && s < 80).length,
      lowPerformingVideos: viralityScores.filter(s => s < 50).length
    };
  }

  calculateTrends(metrics, periodMs) {
    const days = Math.ceil(periodMs / (24 * 60 * 60 * 1000));
    const dailyMetrics = new Array(days).fill(0);

    metrics.forEach(m => {
      const dayIndex = Math.floor((Date.now() - new Date(m.timestamp).getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < days) {
        dailyMetrics[days - 1 - dayIndex]++;
      }
    });

    return {
      daily: dailyMetrics,
      trend: this.calculateTrendDirection(dailyMetrics),
      growth: this.calculateGrowthRate(dailyMetrics)
    };
  }

  generateRecommendations(metrics) {
    const recommendations = [];
    const videosCreated = metrics.filter(m => m.event === 'video_created').length;
    const avgVirality = this.calculateAvgViralityScore(metrics);

    if (videosCreated < 10) {
      recommendations.push({
        type: 'productivity',
        priority: 'high',
        message: 'Create more videos to improve your content strategy',
        action: 'Use batch processing to create multiple videos at once'
      });
    }

    if (avgVirality < 60) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: 'Improve content quality for better engagement',
        action: 'Use A/B testing and platform optimization features'
      });
    }

    const cacheHitRate = this.calculateCacheHitRate(metrics);
    if (cacheHitRate < 0.3) {
      recommendations.push({
        type: 'efficiency',
        priority: 'medium',
        message: 'Low cache hit rate detected',
        action: 'Reuse similar content parameters to benefit from caching'
      });
    }

    return recommendations;
  }

  calculateAvgViralityScore(metrics) {
    const scores = metrics
      .filter(m => m.data?.viralityScore)
      .map(m => m.data.viralityScore);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  calculateTotalDuration(metrics) {
    const durations = metrics
      .filter(m => m.data?.duration)
      .map(m => m.data.duration);
    return durations.reduce((a, b) => a + b, 0);
  }

  calculateAvgProcessingTime(metrics) {
    const times = metrics
      .filter(m => m.data?.processingTime)
      .map(m => m.data.processingTime);
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  }

  calculateSuccessRate(metrics) {
    const total = metrics.filter(m => m.event === 'video_created' || m.event === 'video_failed').length;
    const success = metrics.filter(m => m.event === 'video_created').length;
    return total > 0 ? Math.round((success / total) * 100) : 100;
  }

  calculateCacheHitRate(metrics) {
    const cacheEvents = metrics.filter(m => m.event === 'cache_hit' || m.event === 'cache_miss');
    const hits = metrics.filter(m => m.event === 'cache_hit').length;
    return cacheEvents.length > 0 ? hits / cacheEvents.length : 0;
  }

  calculatePlatformDistribution(metrics) {
    const platforms = {};
    metrics.forEach(m => {
      const platform = m.data?.platform || 'unknown';
      platforms[platform] = (platforms[platform] || 0) + 1;
    });
    return platforms;
  }

  calculateTrendDirection(data) {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    return recent > older * 1.1 ? 'up' : recent < older * 0.9 ? 'down' : 'stable';
  }

  calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((a, b) => a + b, 0);
    const older = data.slice(0, 3).reduce((a, b) => a + b, 0);
    return older > 0 ? Math.round(((recent - older) / older) * 100) : 0;
  }

  parsePeriod(period) {
    const match = period.match(/^(\d+)([dhm])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    
    const [, value, unit] = match;
    const multipliers = { d: 24 * 60 * 60 * 1000, h: 60 * 60 * 1000, m: 60 * 1000 };
    return parseInt(value) * multipliers[unit];
  }
}
