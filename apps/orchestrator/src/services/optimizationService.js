import { logger } from '../utils/logger.js';

const PLATFORM_RULES = {
  tiktok: {
    maxDuration: 60,
    optimalDuration: 15,
    hookWindow: 3,
    aspectRatio: '9:16',
    hashtagCount: 5,
    captionLength: 150,
    trendPriority: 'high'
  },
  'youtube-shorts': {
    maxDuration: 60,
    optimalDuration: 30,
    hookWindow: 5,
    aspectRatio: '9:16',
    hashtagCount: 3,
    captionLength: 100,
    trendPriority: 'medium'
  },
  'instagram-reels': {
    maxDuration: 90,
    optimalDuration: 30,
    hookWindow: 3,
    aspectRatio: '9:16',
    hashtagCount: 10,
    captionLength: 125,
    trendPriority: 'high'
  }
};

export class OptimizationService {
  constructor({ aiService, logger: log }) {
    this.aiService = aiService;
    this.logger = log;
  }

  async optimizeForPlatform(content, platform = 'tiktok') {
    const rules = PLATFORM_RULES[platform];
    if (!rules) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const optimized = {
      platform,
      script: this.optimizeScript(content.script, rules),
      duration: this.calculateOptimalDuration(content.script, rules),
      hashtags: this.optimizeHashtags(content.hashtags || [], rules),
      caption: this.optimizeCaption(content.script, rules),
      recommendations: []
    };

    // Add recommendations
    if (optimized.duration > rules.maxDuration) {
      optimized.recommendations.push(`Reduce duration to ${rules.maxDuration}s max`);
    }
    if (optimized.hashtags.length > rules.hashtagCount) {
      optimized.recommendations.push(`Use ${rules.hashtagCount} hashtags for best reach`);
    }

    this.logger.info('Content optimized', { platform, duration: optimized.duration });
    return optimized;
  }

  optimizeScript(script, rules) {
    const sentences = script.split(/[.!?]/).filter(Boolean);
    
    // Ensure strong hook in first 3-5 seconds
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (!this.isStrongHook(firstSentence)) {
        sentences[0] = this.strengthenHook(firstSentence);
      }
    }

    return sentences.join('. ') + '.';
  }

  isStrongHook(sentence) {
    const strongWords = ['what if', 'imagine', 'never', 'always', 'shocking', 'secret', 'truth'];
    return strongWords.some(word => sentence.toLowerCase().includes(word));
  }

  strengthenHook(sentence) {
    return `What if I told you: ${sentence}`;
  }

  calculateOptimalDuration(script, rules) {
    const wordCount = script.split(/\s+/).length;
    const wordsPerSecond = 2.5; // Average speaking rate
    const duration = Math.ceil(wordCount / wordsPerSecond);
    
    return Math.min(duration, rules.maxDuration);
  }

  optimizeHashtags(hashtags, rules) {
    // Prioritize trending and relevant hashtags
    const optimized = hashtags.slice(0, rules.hashtagCount);
    
    // Add platform-specific hashtags if needed
    const platformTags = {
      tiktok: ['#fyp', '#foryou', '#viral'],
      'youtube-shorts': ['#shorts', '#viral'],
      'instagram-reels': ['#reels', '#viral', '#explore']
    };

    const platformSpecific = platformTags[rules.platform] || [];
    platformSpecific.forEach(tag => {
      if (optimized.length < rules.hashtagCount && !optimized.includes(tag)) {
        optimized.push(tag);
      }
    });

    return optimized;
  }

  optimizeCaption(script, rules) {
    const firstSentence = script.split(/[.!?]/)[0];
    let caption = firstSentence.trim();
    
    if (caption.length > rules.captionLength) {
      caption = caption.substring(0, rules.captionLength - 3) + '...';
    }

    return caption;
  }

  async optimizeMultiPlatform(content) {
    const platforms = ['tiktok', 'youtube-shorts', 'instagram-reels'];
    const optimizations = {};

    for (const platform of platforms) {
      optimizations[platform] = await this.optimizeForPlatform(content, platform);
    }

    this.logger.info('Multi-platform optimization complete', { 
      platforms: platforms.length 
    });

    return optimizations;
  }

  getOptimalPostTime(platform, timezone = 'UTC') {
    const times = {
      tiktok: { weekday: '19:00-21:00', weekend: '11:00-13:00' },
      'youtube-shorts': { weekday: '14:00-16:00', weekend: '10:00-12:00' },
      'instagram-reels': { weekday: '11:00-13:00', weekend: '09:00-11:00' }
    };

    return times[platform] || times.tiktok;
  }
}
