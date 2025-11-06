/**
 * Smart Asset Recommender Service
 * AI-powered recommendations for backgrounds, music, and sound effects
 */

export class SmartAssetRecommenderService {
  constructor({ aiService, assetsService, stockMediaService, logger }) {
    this.aiService = aiService;
    this.assetsService = assetsService;
    this.stockMediaService = stockMediaService;
    this.logger = logger;
  }

  /**
   * Get comprehensive asset recommendations based on script
   */
  async getRecommendations(scriptData) {
    this.logger.info('Generating asset recommendations', { scriptLength: scriptData.content?.length });

    try {
      const [backgrounds, music, sfx] = await Promise.all([
        this._recommendBackgrounds(scriptData),
        this._recommendMusic(scriptData),
        this._recommendSFX(scriptData)
      ]);

      return {
        success: true,
        recommendations: { backgrounds, music, sfx },
        confidence: this._calculateConfidence({ backgrounds, music, sfx })
      };
    } catch (error) {
      this.logger.error('Asset recommendations failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Recommend backgrounds based on script content
   */
  async _recommendBackgrounds(scriptData) {
    const analysis = this._analyzeScriptContext(scriptData.content);
    const keywords = this._extractVisualKeywords(scriptData.content, analysis);

    // Get local backgrounds
    const localBackgrounds = await this._getLocalBackgrounds(analysis);

    // Get stock media suggestions
    let stockSuggestions = [];
    try {
      const stockResults = await this.stockMediaService.searchVideos({
        query: keywords[0],
        perPage: 5
      });
      stockSuggestions = stockResults.videos || [];
    } catch (e) {
      this.logger.warn('Stock media search failed', { error: e.message });
    }

    return {
      local: localBackgrounds.slice(0, 5),
      stock: stockSuggestions.slice(0, 5),
      keywords,
      reasoning: `Based on ${analysis.mood} mood and ${analysis.setting} setting`
    };
  }

  /**
   * Recommend music based on script mood and pacing
   */
  async _recommendMusic(scriptData) {
    const analysis = this._analyzeScriptContext(scriptData.content);
    
    const recommendations = [
      {
        name: 'Dark Ambient',
        mood: analysis.mood,
        tempo: analysis.tempo,
        genre: 'ambient',
        confidence: 0.9,
        reasoning: 'Matches script mood and pacing'
      },
      {
        name: 'Suspenseful Strings',
        mood: analysis.mood,
        tempo: 'medium',
        genre: 'orchestral',
        confidence: 0.8,
        reasoning: 'Builds tension effectively'
      },
      {
        name: 'Eerie Synth',
        mood: analysis.mood,
        tempo: analysis.tempo,
        genre: 'electronic',
        confidence: 0.75,
        reasoning: 'Modern horror aesthetic'
      }
    ];

    return recommendations.filter(r => this._matchesMood(r.mood, analysis.mood));
  }

  /**
   * Recommend sound effects based on script events
   */
  async _recommendSFX(scriptData) {
    const events = this._extractEvents(scriptData.content);
    
    const sfxMap = {
      door: ['door-creak.mp3', 'door-slam.mp3'],
      footsteps: ['footsteps-wood.mp3', 'footsteps-gravel.mp3'],
      wind: ['wind-howl.mp3', 'wind-whisper.mp3'],
      scream: ['scream-distant.mp3', 'scream-terror.mp3'],
      heartbeat: ['heartbeat-fast.mp3', 'heartbeat-slow.mp3']
    };

    const recommendations = [];
    events.forEach(event => {
      if (sfxMap[event]) {
        recommendations.push({
          event,
          files: sfxMap[event],
          timing: 'auto-detect',
          confidence: 0.85
        });
      }
    });

    return recommendations;
  }

  /**
   * Analyze script context for mood, setting, tempo
   */
  _analyzeScriptContext(content) {
    const lower = content.toLowerCase();
    
    // Detect mood
    let mood = 'neutral';
    if (lower.match(/dark|scary|horror|fear|terror|creepy/)) mood = 'dark';
    else if (lower.match(/mystery|unknown|strange|suspicious/)) mood = 'mysterious';
    else if (lower.match(/happy|joy|fun|exciting|upbeat/)) mood = 'upbeat';
    else if (lower.match(/sad|melancholy|tragic|loss/)) mood = 'sad';

    // Detect setting
    let setting = 'generic';
    if (lower.match(/forest|woods|trees|nature/)) setting = 'forest';
    else if (lower.match(/city|urban|street|building/)) setting = 'urban';
    else if (lower.match(/house|home|room|indoor/)) setting = 'indoor';
    else if (lower.match(/ocean|sea|water|beach/)) setting = 'water';

    // Detect tempo
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const tempo = avgLength < 80 ? 'fast' : avgLength < 120 ? 'medium' : 'slow';

    return { mood, setting, tempo };
  }

  /**
   * Extract visual keywords from script
   */
  _extractVisualKeywords(content, analysis) {
    const keywords = [analysis.setting];
    
    const visualWords = content.match(/\b(dark|night|fog|rain|storm|sunset|dawn|shadow|light)\b/gi);
    if (visualWords) {
      keywords.push(...visualWords.slice(0, 3).map(w => w.toLowerCase()));
    }

    return [...new Set(keywords)];
  }

  /**
   * Get local backgrounds matching analysis
   */
  async _getLocalBackgrounds(analysis) {
    try {
      const allBackgrounds = await this.assetsService.getBackgrounds();
      
      return allBackgrounds
        .filter(bg => {
          const name = bg.name.toLowerCase();
          return name.includes(analysis.mood) || 
                 name.includes(analysis.setting) ||
                 name.includes('generic');
        })
        .map(bg => ({
          ...bg,
          matchReason: `Matches ${analysis.mood} mood`,
          confidence: 0.8
        }));
    } catch (e) {
      this.logger.warn('Failed to get local backgrounds', { error: e.message });
      return [];
    }
  }

  /**
   * Extract events from script for SFX
   */
  _extractEvents(content) {
    const events = [];
    const lower = content.toLowerCase();

    if (lower.match(/door|knock|enter|exit/)) events.push('door');
    if (lower.match(/walk|step|run|approach/)) events.push('footsteps');
    if (lower.match(/wind|breeze|storm/)) events.push('wind');
    if (lower.match(/scream|yell|shout/)) events.push('scream');
    if (lower.match(/heart|pulse|beat|nervous/)) events.push('heartbeat');

    return [...new Set(events)];
  }

  /**
   * Check if moods match
   */
  _matchesMood(musicMood, scriptMood) {
    if (musicMood === scriptMood) return true;
    if (musicMood === 'dark' && scriptMood === 'mysterious') return true;
    if (musicMood === 'mysterious' && scriptMood === 'dark') return true;
    return false;
  }

  /**
   * Calculate overall confidence score
   */
  _calculateConfidence(recommendations) {
    const bgConfidence = recommendations.backgrounds.local.length > 0 ? 0.8 : 0.5;
    const musicConfidence = recommendations.music.length > 0 ? 0.85 : 0.5;
    const sfxConfidence = recommendations.sfx.length > 0 ? 0.75 : 0.5;

    return Math.round(((bgConfidence + musicConfidence + sfxConfidence) / 3) * 100) / 100;
  }
}
