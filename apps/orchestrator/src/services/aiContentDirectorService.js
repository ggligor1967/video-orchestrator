/**
 * AI Content Director Service
 * Intelligent context-aware creative decisions for video production
 */

export class AIContentDirectorService {
  constructor({ logger }) {
    this.logger = logger;
    
    // Note: Services will be lazy-loaded from container to avoid circular dependencies
    this._aiService = null;
    this._trendMonitoringService = null;
    this._backgroundService = null;
    this._ttsService = null;
    this._audioService = null;
    this._subsService = null;
    
    // Creative decision templates by genre
    this.templates = {
      horror: {
        backgrounds: ['dark-forest', 'abandoned-house', 'cemetery-night'],
        voices: { male: 'en-US-GuyNeural', female: 'en-US-JennyNeural' },
        music: ['suspense-ambient', 'horror-tension', 'dark-drone'],
        pacing: 'slow-build',
        subtitleStyle: 'glitch-text',
        colorGrading: 'desaturated-cold',
        effects: ['vignette', 'film-grain']
      },
      mystery: {
        backgrounds: ['foggy-city', 'detective-office', 'crime-scene'],
        voices: { male: 'en-US-EricNeural', female: 'en-US-AriaNeural' },
        music: ['mystery-piano', 'tension-strings', 'noir-jazz'],
        pacing: 'medium-suspense',
        subtitleStyle: 'typewriter',
        colorGrading: 'noir-contrast',
        effects: ['blur-edges', 'letterbox']
      },
      paranormal: {
        backgrounds: ['haunted-mansion', 'spirit-realm', 'astral-plane'],
        voices: { male: 'en-US-DavisNeural', female: 'en-US-SaraNeural' },
        music: ['paranormal-ambience', 'ghost-whispers', 'otherworldly'],
        pacing: 'variable-tension',
        subtitleStyle: 'fade-ethereal',
        colorGrading: 'blue-tint-ethereal',
        effects: ['glow', 'particle-overlay']
      },
      'true-crime': {
        backgrounds: ['courtroom', 'evidence-board', 'police-station'],
        voices: { male: 'en-US-AndrewNeural', female: 'en-US-MichelleNeural' },
        music: ['documentary-serious', 'investigation-theme', 'true-crime-ambient'],
        pacing: 'steady-factual',
        subtitleStyle: 'clean-modern',
        colorGrading: 'documentary-realistic',
        effects: ['stabilization', 'color-correction']
      }
    };
  }

  /**
   * Analyze script context using AI
   */
  async analyzeContext(script, genre, options = {}) {
    try {
      this.logger.info('Analyzing script context', { genre, scriptLength: script.length });
      
      if (!this.aiService) {
        return this.getFallbackContext(genre);
      }

      // Use AI to extract deep insights
      const prompt = `Analyze this ${genre} script and extract:
1. Primary mood (intense, subtle, eerie, suspenseful, mysterious)
2. Key scenes (list 3-5 main visual scenes)
3. Emotional arc (rising, falling, flat, wave)
4. Target audience (teens, young-adults, adults, general)
5. Viral hooks (catchy phrases or moments)
6. Pacing requirements (fast, medium, slow, variable)

Script: "${script.substring(0, 1000)}"

Return JSON format:
{
  "primary_mood": "...",
  "key_scenes": ["scene1", "scene2"],
  "emotional_arc": "...",
  "target_audience": "...",
  "viral_hooks": ["hook1", "hook2"],
  "pacing_requirements": "..."
}`;

      const analysis = await this.aiService.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });

      // Parse AI response
      let parsed;
      try {
        const jsonMatch = analysis.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (e) {
        this.logger.warn('Failed to parse AI response', { error: e.message });
        parsed = {};
      }

      return {
        mood: parsed.primary_mood || 'neutral',
        scenes: parsed.key_scenes || ['general-scene'],
        emotionalArc: parsed.emotional_arc || 'flat',
        audience: parsed.target_audience || 'general',
        viralHooks: parsed.viral_hooks || [],
        pacing: parsed.pacing_requirements || 'medium',
        trendAlignment: 0.5, // Could integrate with trend API
        contextScore: this.calculateContextScore(parsed),
        rawAnalysis: parsed
      };

    } catch (error) {
      this.logger.error('Context analysis failed', { error: error.message });
      return this.getFallbackContext(genre);
    }
  }

  /**
   * Make creative decisions based on context
   */
  async makeCreativeDecisions(context, genre, userPreferences = {}) {
    this.logger.info('Making creative decisions', { genre, mood: context.mood });
    
    const template = this.templates[genre] || this.templates['mystery'];
    
    const decisions = {
      background: this.selectBackground(context, template, userPreferences),
      voice: this.selectVoice(context, template, userPreferences),
      music: this.selectMusic(context, template, userPreferences),
      subtitleStyle: this.selectSubtitleStyle(context, template, userPreferences),
      pacing: this.selectPacing(context, template),
      effects: this.selectEffects(context, genre),
      timing: this.optimizeTiming(context),
      colorGrading: template.colorGrading
    };
    
    decisions.confidence = this.calculateConfidence(decisions, context);
    decisions.alternatives = this.generateAlternatives(decisions, context, template);
    
    return decisions;
  }

  /**
   * Direct full video production
   */
  async directVideo(script, genre, options = {}) {
    try {
      this.logger.info('Starting AI-directed video production', { genre });
      
      // Phase 1: Context Analysis
      const context = await this.analyzeContext(script, genre, options);
      
      // Phase 2: Creative Decisions
      const decisions = await this.makeCreativeDecisions(context, genre, options.preferences);
      
      // Phase 3: Pipeline Configuration
      const pipeline = this.configurePipeline(decisions, script, context);
      
      // Phase 4: Quality Predictions
      const predictions = this.predictQuality(pipeline, context);
      
      // Phase 5: Execution Plan
      const executionPlan = this.createExecutionPlan(pipeline);
      
      return {
        context,
        decisions,
        pipeline,
        predictions,
        executionPlan,
        estimatedTime: this.estimateProductionTime(pipeline),
        confidence: decisions.confidence
      };

    } catch (error) {
      this.logger.error('AI direction failed', { error: error.message });
      return this.getFallbackDirection(script, genre);
    }
  }

  /**
   * Select background based on context
   */
  selectBackground(context, template, preferences) {
    if (preferences.backgroundId) {
      return { id: preferences.backgroundId, confidence: 1.0, source: 'user' };
    }
    
    // Score backgrounds
    let selectedBg = template.backgrounds[0];
    let score = 0.7;
    
    // Boost for mood match
    if (context.mood === 'intense') {
      selectedBg = template.backgrounds[0];
      score = 0.85;
    } else if (context.mood === 'subtle') {
      selectedBg = template.backgrounds[template.backgrounds.length - 1];
      score = 0.8;
    }
    
    return {
      id: selectedBg,
      confidence: score,
      reasoning: `Selected ${selectedBg} for ${context.mood} mood in ${context.emotionalArc} arc`,
      source: 'ai'
    };
  }

  /**
   * Select voice based on context
   */
  selectVoice(context, template, preferences) {
    if (preferences.voiceId) {
      return { id: preferences.voiceId, confidence: 1.0, source: 'user' };
    }
    
    // Determine gender (could be based on audience data)
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const voiceId = template.voices[gender];
    
    // Adjust speed based on pacing
    let speed = 1.0;
    if (context.pacing === 'slow' || context.pacing === 'slow-build') {
      speed = 0.9;
    } else if (context.pacing === 'fast') {
      speed = 1.1;
    }
    
    return {
      id: voiceId,
      gender,
      speed,
      confidence: 0.85,
      reasoning: `Selected ${gender} voice at ${speed}x speed for ${context.pacing} pacing`,
      source: 'ai'
    };
  }

  /**
   * Select music based on context
   */
  selectMusic(context, template, preferences) {
    if (preferences.musicId) {
      return { id: preferences.musicId, confidence: 1.0, source: 'user' };
    }
    
    // Select from template
    const musicIndex = context.mood === 'intense' ? 0 : 
                      context.mood === 'subtle' ? 2 : 1;
    const musicId = template.music[musicIndex];
    
    // Calculate volume
    const volume = context.mood === 'intense' ? 0.6 : 0.4;
    
    return {
      id: musicId,
      volume,
      fadeIn: 2000,
      fadeOut: 3000,
      confidence: 0.8,
      reasoning: `Selected ${musicId} at ${volume} volume for ${context.mood} mood`,
      source: 'ai'
    };
  }

  /**
   * Select subtitle style
   */
  selectSubtitleStyle(context, template, preferences) {
    if (preferences.subtitleStyle) {
      return { style: preferences.subtitleStyle, confidence: 1.0, source: 'user' };
    }
    
    let style = template.subtitleStyle;
    
    // Override for viral potential
    if (context.viralHooks && context.viralHooks.length > 3) {
      style = 'animated-pop';
    }
    
    return {
      style,
      position: 'center',
      animation: context.pacing === 'slow-build' ? 'fade' : 'pop',
      highlightKeywords: context.viralHooks || [],
      confidence: 0.75,
      source: 'ai'
    };
  }

  /**
   * Select pacing
   */
  selectPacing(context, template) {
    if (context.emotionalArc === 'rising') {
      return {
        type: 'accelerating',
        startSpeed: 0.9,
        endSpeed: 1.1,
        transitionPoint: 0.6
      };
    } else if (context.emotionalArc === 'falling') {
      return {
        type: 'decelerating',
        startSpeed: 1.1,
        endSpeed: 0.9,
        transitionPoint: 0.4
      };
    }
    
    return {
      type: template.pacing,
      speed: 1.0,
      consistent: true
    };
  }

  /**
   * Select effects based on genre
   */
  selectEffects(context, genre) {
    const template = this.templates[genre] || this.templates['mystery'];
    const effects = [...template.effects];
    
    // Add viral emphasis
    if (context.viralHooks && context.viralHooks.length > 0) {
      effects.push({
        type: 'zoom-punch',
        timing: 'hooks',
        intensity: 0.6
      });
    }
    
    return effects;
  }

  /**
   * Optimize timing
   */
  optimizeTiming(context) {
    return {
      hookDuration: 3000, // First 3 seconds
      peakMoment: context.emotionalArc === 'rising' ? 0.8 : 0.5,
      quietMoments: [],
      emphasizeTimestamps: (context.viralHooks || []).map((hook, i) => ({
        time: (i + 1) * 10,
        duration: 2000,
        effect: 'emphasis'
      }))
    };
  }

  /**
   * Calculate confidence
   */
  calculateConfidence(decisions, context) {
    const scores = [
      decisions.background?.confidence || 0.5,
      decisions.voice?.confidence || 0.5,
      decisions.music?.confidence || 0.5,
      decisions.subtitleStyle?.confidence || 0.5
    ];
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const boost = context.trendAlignment > 0.8 ? 0.1 : 0;
    
    return Math.min(avg + boost, 1.0);
  }

  /**
   * Generate alternatives
   */
  generateAlternatives(primary, context, template) {
    return [
      {
        name: 'Trend-Optimized',
        description: 'Maximizes viral potential',
        changes: {
          subtitleStyle: 'tiktok-viral',
          pacing: 'quick-cuts'
        },
        confidence: 0.7
      },
      {
        name: 'Artistic Vision',
        description: 'Emphasizes storytelling',
        changes: {
          effects: ['film-grain', 'letterbox'],
          pacing: 'cinematic'
        },
        confidence: 0.65
      }
    ];
  }

  /**
   * Configure pipeline
   */
  configurePipeline(decisions, script, context) {
    return {
      steps: [
        {
          name: 'generate-voiceover',
          service: 'ttsService',
          config: {
            text: script,
            voice: decisions.voice.id,
            speed: decisions.voice.speed
          },
          parallel: true
        },
        {
          name: 'process-background',
          service: 'videoService',
          config: {
            backgroundId: decisions.background.id,
            effects: decisions.effects
          },
          parallel: true
        },
        {
          name: 'mix-audio',
          service: 'audioService',
          config: {
            musicId: decisions.music.id,
            musicVolume: decisions.music.volume
          },
          dependsOn: ['generate-voiceover']
        },
        {
          name: 'generate-subtitles',
          service: 'subsService',
          config: {
            style: decisions.subtitleStyle
          },
          dependsOn: ['generate-voiceover']
        },
        {
          name: 'final-composition',
          service: 'ffmpegService',
          config: {
            colorGrading: decisions.colorGrading
          },
          dependsOn: ['process-background', 'mix-audio', 'generate-subtitles']
        }
      ]
    };
  }

  /**
   * Predict quality
   */
  predictQuality(pipeline, context) {
    return {
      viralPotential: this.calculateViralPotential(context),
      productionQuality: 0.85,
      audienceMatch: 0.75,
      overallScore: 0.8
    };
  }

  /**
   * Calculate viral potential
   */
  calculateViralPotential(context) {
    let score = 0.5;
    
    if (context.viralHooks) {
      score += Math.min(context.viralHooks.length * 0.1, 0.3);
    }
    
    score += context.trendAlignment * 0.2;
    
    return Math.min(score, 1.0);
  }

  /**
   * Create execution plan
   */
  createExecutionPlan(pipeline) {
    const parallelSteps = pipeline.steps.filter(s => s.parallel);
    const sequentialSteps = pipeline.steps.filter(s => !s.parallel);
    
    return {
      phases: [
        {
          name: 'Preparation',
          parallel: true,
          steps: parallelSteps.map(s => s.name),
          duration: 30
        },
        {
          name: 'Processing',
          parallel: false,
          steps: sequentialSteps.map(s => s.name),
          duration: 90
        }
      ],
      totalDuration: 120
    };
  }

  /**
   * Estimate production time
   */
  estimateProductionTime(pipeline) {
    const baseTime = 60;
    const stepTime = pipeline.steps.length * 15;
    return baseTime + stepTime;
  }

  /**
   * Calculate context score
   */
  calculateContextScore(analysis) {
    let score = 0;
    if (analysis.primary_mood) score += 0.25;
    if (analysis.key_scenes?.length > 0) score += 0.25;
    if (analysis.viral_hooks?.length > 0) score += 0.25;
    if (analysis.emotional_arc) score += 0.25;
    return score;
  }

  /**
   * Get fallback context
   */
  getFallbackContext(genre) {
    return {
      mood: 'neutral',
      scenes: ['general-scene'],
      emotionalArc: 'flat',
      audience: 'general',
      viralHooks: [],
      pacing: 'medium',
      trendAlignment: 0.5,
      contextScore: 0.3,
      fallback: true
    };
  }

  /**
   * Get fallback direction
   */
  getFallbackDirection(script, genre) {
    const template = this.templates[genre] || this.templates['mystery'];
    
    return {
      context: this.getFallbackContext(genre),
      decisions: {
        background: { id: template.backgrounds[0], confidence: 0.5 },
        voice: { id: template.voices.male, confidence: 0.5 },
        music: { id: template.music[0], confidence: 0.5 },
        subtitleStyle: { style: template.subtitleStyle, confidence: 0.5 },
        pacing: { type: template.pacing, speed: 1.0 },
        effects: template.effects,
        colorGrading: template.colorGrading,
        confidence: 0.5
      },
      pipeline: {
        steps: []
      },
      predictions: {
        viralPotential: 0.3,
        productionQuality: 0.5,
        audienceMatch: 0.5
      },
      executionPlan: {
        phases: [],
        totalDuration: 180
      },
      estimatedTime: 180,
      fallback: true
    };
  }
}
