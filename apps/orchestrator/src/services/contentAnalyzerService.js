/**
 * AI Content Analyzer & Auto-Optimizer Service
 * 
 * Analyzes scripts, backgrounds, and voice-overs to provide context-aware
 * optimization suggestions for maximum engagement and viral potential.
 */

export class ContentAnalyzerService {
  constructor({ aiService, logger }) {
    this.aiService = aiService;
    this.logger = logger;
  }

  /**
   * Analyze script content and provide optimization suggestions
   */
  async analyzeScript(scriptData) {
    this.logger.info('Analyzing script content', { scriptLength: scriptData.content?.length });

    try {
      const analysis = await this.aiService.generateCompletion({
        prompt: this._buildScriptAnalysisPrompt(scriptData),
        temperature: 0.3,
        maxTokens: 1000
      });

      const parsed = this._parseAnalysisResponse(analysis);
      
      this.logger.info('Script analysis complete', { 
        engagementScore: parsed.engagementScore,
        suggestionsCount: parsed.suggestions.length 
      });

      return {
        success: true,
        analysis: parsed,
        optimizations: this._generateOptimizations(parsed, scriptData)
      };
    } catch (error) {
      this.logger.error('Script analysis failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze complete video context (script + background + audio)
   */
  async analyzeVideoContext(contextData) {
    this.logger.info('Analyzing video context', { 
      hasScript: !!contextData.script,
      hasBackground: !!contextData.background,
      hasAudio: !!contextData.audio
    });

    try {
      const [scriptAnalysis, coherenceScore, viralPotential] = await Promise.all([
        contextData.script ? this.analyzeScript(contextData.script) : null,
        this._analyzeCoherence(contextData),
        this._predictViralPotential(contextData)
      ]);

      const recommendations = this._generateContextualRecommendations({
        scriptAnalysis,
        coherenceScore,
        viralPotential,
        contextData
      });

      this.logger.info('Video context analysis complete', {
        coherenceScore,
        viralPotential: viralPotential.score,
        recommendationsCount: recommendations.length
      });

      return {
        success: true,
        scriptAnalysis,
        coherenceScore,
        viralPotential,
        recommendations,
        overallScore: this._calculateOverallScore({ coherenceScore, viralPotential, scriptAnalysis })
      };
    } catch (error) {
      this.logger.error('Video context analysis failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get real-time optimization suggestions during editing
   */
  async getRealtimeSuggestions(currentState) {
    this.logger.info('Generating realtime suggestions');

    try {
      const suggestions = [];

      // Pacing analysis
      if (currentState.script) {
        const pacing = this._analyzePacing(currentState.script);
        if (pacing.issues.length > 0) {
          suggestions.push({
            type: 'pacing',
            priority: 'high',
            message: 'Script pacing needs adjustment',
            details: pacing.issues,
            autoFix: pacing.autoFix
          });
        }
      }

      // Hook strength
      if (currentState.script?.content) {
        const hookScore = this._analyzeHook(currentState.script.content);
        if (hookScore < 7) {
          suggestions.push({
            type: 'hook',
            priority: 'critical',
            message: 'Opening hook is weak',
            currentScore: hookScore,
            suggestions: await this._generateHookAlternatives(currentState.script.content)
          });
        }
      }

      // Background-script alignment
      if (currentState.script && currentState.background) {
        const alignment = this._analyzeAlignment(currentState.script, currentState.background);
        if (alignment.score < 0.7) {
          suggestions.push({
            type: 'alignment',
            priority: 'medium',
            message: 'Background doesn\'t match script tone',
            score: alignment.score,
            betterOptions: alignment.alternatives
          });
        }
      }

      return { success: true, suggestions, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Realtime suggestions failed', { error: error.message });
      return { success: false, suggestions: [], error: error.message };
    }
  }

  // Private helper methods

  _buildScriptAnalysisPrompt(scriptData) {
    return `Analyze this ${scriptData.genre || 'video'} script for engagement and viral potential:

SCRIPT:
${scriptData.content}

Provide analysis in JSON format:
{
  "engagementScore": 0-10,
  "hookStrength": 0-10,
  "pacing": "slow|medium|fast",
  "emotionalImpact": 0-10,
  "viralElements": ["element1", "element2"],
  "weakPoints": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;
  }

  _parseAnalysisResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      this.logger.warn('Failed to parse AI response, using defaults');
    }

    return {
      engagementScore: 5,
      hookStrength: 5,
      pacing: 'medium',
      emotionalImpact: 5,
      viralElements: [],
      weakPoints: [],
      suggestions: []
    };
  }

  _generateOptimizations(analysis, scriptData) {
    const optimizations = [];

    if (analysis.hookStrength < 7) {
      optimizations.push({
        type: 'hook',
        priority: 'high',
        action: 'strengthen_opening',
        impact: 'high'
      });
    }

    if (analysis.pacing === 'slow') {
      optimizations.push({
        type: 'pacing',
        priority: 'medium',
        action: 'increase_tempo',
        impact: 'medium'
      });
    }

    if (analysis.emotionalImpact < 6) {
      optimizations.push({
        type: 'emotion',
        priority: 'medium',
        action: 'add_emotional_triggers',
        impact: 'high'
      });
    }

    return optimizations;
  }

  async _analyzeCoherence(contextData) {
    let score = 1.0;

    // Check script-background coherence
    if (contextData.script && contextData.background) {
      const scriptTone = this._detectTone(contextData.script.content || '');
      const bgTone = this._detectTone(contextData.background.description || '');
      score *= this._calculateToneMatch(scriptTone, bgTone);
    }

    // Check audio-script coherence
    if (contextData.script && contextData.audio) {
      const scriptMood = this._detectMood(contextData.script.content || '');
      const audioMood = contextData.audio.mood || 'neutral';
      score *= scriptMood === audioMood ? 1.0 : 0.8;
    }

    return Math.round(score * 100) / 100;
  }

  async _predictViralPotential(contextData) {
    let score = 0;
    const factors = [];

    // Hook strength (0-30 points)
    if (contextData.script?.content) {
      const hookScore = this._analyzeHook(contextData.script.content);
      score += hookScore * 3;
      factors.push({ factor: 'hook', score: hookScore * 3, weight: 0.3 });
    }

    // Emotional impact (0-25 points)
    if (contextData.script?.content) {
      const emotionScore = this._analyzeEmotionalImpact(contextData.script.content);
      score += emotionScore * 2.5;
      factors.push({ factor: 'emotion', score: emotionScore * 2.5, weight: 0.25 });
    }

    // Visual appeal (0-20 points)
    if (contextData.background) {
      const visualScore = this._analyzeVisualAppeal(contextData.background);
      score += visualScore * 2;
      factors.push({ factor: 'visual', score: visualScore * 2, weight: 0.2 });
    }

    // Pacing (0-15 points)
    if (contextData.script?.content) {
      const pacingScore = this._analyzePacing(contextData.script).score;
      score += pacingScore * 1.5;
      factors.push({ factor: 'pacing', score: pacingScore * 1.5, weight: 0.15 });
    }

    // Trend alignment (0-10 points)
    const trendScore = 5; // Placeholder
    score += trendScore;
    factors.push({ factor: 'trends', score: trendScore, weight: 0.1 });

    return {
      score: Math.min(Math.round(score), 100),
      factors,
      prediction: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
    };
  }

  _generateContextualRecommendations(data) {
    const recommendations = [];

    if (data.coherenceScore < 0.7) {
      recommendations.push({
        type: 'coherence',
        priority: 'high',
        message: 'Improve alignment between script and visuals',
        actionable: true
      });
    }

    if (data.viralPotential.score < 50) {
      recommendations.push({
        type: 'viral',
        priority: 'high',
        message: 'Boost viral potential with stronger hooks',
        suggestions: ['Add surprise element', 'Increase emotional stakes', 'Improve pacing']
      });
    }

    if (data.scriptAnalysis?.analysis?.engagementScore < 6) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Enhance script engagement',
        suggestions: data.scriptAnalysis.analysis.suggestions
      });
    }

    return recommendations;
  }

  _calculateOverallScore(data) {
    const weights = { coherence: 0.3, viral: 0.4, engagement: 0.3 };
    
    const coherenceScore = data.coherenceScore * 100;
    const viralScore = data.viralPotential.score;
    const engagementScore = (data.scriptAnalysis?.analysis?.engagementScore || 5) * 10;

    return Math.round(
      coherenceScore * weights.coherence +
      viralScore * weights.viral +
      engagementScore * weights.engagement
    );
  }

  _analyzePacing(script) {
    const content = script.content || '';
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    const issues = [];
    const score = avgLength < 80 ? 8 : avgLength < 120 ? 10 : 6;

    if (avgLength > 120) {
      issues.push('Sentences too long - reduce to under 100 characters');
    }

    return {
      score,
      avgSentenceLength: Math.round(avgLength),
      issues,
      autoFix: issues.length > 0 ? 'Split long sentences' : null
    };
  }

  _analyzeHook(content) {
    const firstSentence = content.split(/[.!?]/)[0] || '';
    let score = 5;

    // Check for question
    if (firstSentence.includes('?')) score += 2;
    
    // Check for power words
    const powerWords = ['shocking', 'secret', 'never', 'always', 'discover', 'revealed'];
    if (powerWords.some(w => firstSentence.toLowerCase().includes(w))) score += 2;

    // Check length (ideal: 10-20 words)
    const wordCount = firstSentence.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 20) score += 1;

    return Math.min(score, 10);
  }

  async _generateHookAlternatives(content) {
    const topic = content.substring(0, 100);
    return [
      `What if I told you ${topic.toLowerCase()}...?`,
      `You won't believe what happened when...`,
      `The shocking truth about ${topic.toLowerCase()}`
    ];
  }

  _analyzeAlignment(script, background) {
    const scriptTone = this._detectTone(script.content || '');
    const bgTone = this._detectTone(background.description || background.name || '');
    
    return {
      score: this._calculateToneMatch(scriptTone, bgTone),
      alternatives: ['dark-forest.mp4', 'mysterious-fog.mp4', 'urban-night.mp4']
    };
  }

  _detectTone(text) {
    const lower = text.toLowerCase();
    if (lower.match(/dark|scary|horror|fear|terror/)) return 'dark';
    if (lower.match(/mystery|unknown|strange|weird/)) return 'mysterious';
    if (lower.match(/happy|joy|fun|exciting/)) return 'upbeat';
    return 'neutral';
  }

  _detectMood(text) {
    const lower = text.toLowerCase();
    if (lower.match(/dark|scary|horror/)) return 'dark';
    if (lower.match(/mystery|suspense/)) return 'mysterious';
    if (lower.match(/happy|upbeat/)) return 'upbeat';
    return 'neutral';
  }

  _calculateToneMatch(tone1, tone2) {
    if (tone1 === tone2) return 1.0;
    if ((tone1 === 'dark' && tone2 === 'mysterious') || 
        (tone1 === 'mysterious' && tone2 === 'dark')) return 0.8;
    return 0.5;
  }

  _analyzeEmotionalImpact(content) {
    const emotionalWords = ['fear', 'terror', 'shocking', 'amazing', 'incredible', 'horrifying'];
    const matches = emotionalWords.filter(w => content.toLowerCase().includes(w)).length;
    return Math.min(matches * 2 + 3, 10);
  }

  _analyzeVisualAppeal(background) {
    // Placeholder - could analyze resolution, composition, etc.
    return 7;
  }
}
