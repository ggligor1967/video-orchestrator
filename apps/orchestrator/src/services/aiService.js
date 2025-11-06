import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { retryWithBackoff, RETRY_PRESETS } from '../utils/retryHandler.js';
import { withTimeout, TIMEOUTS } from '../utils/processTimeout.js';

const SCRIPT_PROMPTS = {
  horror: `Create a captivating horror story script for a vertical video (TikTok/Shorts format).
    - Keep it engaging and suspenseful
    - Include dramatic hooks in the first 3 seconds
    - Target duration: {duration} seconds
    - Topic: {topic}
    - Style: Narrative storytelling with tension buildup
    - End with a cliffhanger or shocking revelation`,
  
  mystery: `Create an intriguing mystery story script for a vertical video format.
    - Start with a compelling question or mysterious event
    - Build suspense throughout
    - Target duration: {duration} seconds
    - Topic: {topic}
    - Include plot twists and revelations
    - Keep viewers guessing until the end`,
  
  paranormal: `Create a paranormal story script for vertical video content.
    - Focus on supernatural events and unexplained phenomena
    - Create an eerie, atmospheric tone
    - Target duration: {duration} seconds
    - Topic: {topic}
    - Include mysterious elements and supernatural encounters
    - Build tension with unexplained occurrences`,
  
  'true crime': `Create a true crime story script for vertical video format.
    - Present factual information in an engaging way
    - Focus on compelling details and timeline
    - Target duration: {duration} seconds
    - Topic: {topic}
    - Include key facts, motives, and outcomes
    - Maintain respectful tone while being engaging`
};

export class AIService {
  constructor({ logger, cacheService, config }) {
    this.logger = logger;
    this.cacheService = cacheService;
    this.config = config;
    this.isMockMode = this.config.ai.provider === 'mock';

    // Initialize AI clients only if not in mock mode and keys are provided
    this.openaiClient = (!this.isMockMode && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
      : null;
    
    this.geminiClient = (!this.isMockMode && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') 
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) 
      : null;
  }

  async generateScript({ topic, genre, duration = 60, style = 'story' }) {
    const cacheKey = this.cacheService.generateKey('script', { topic, genre, duration, style });
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.info('Script retrieved from cache', { topic, genre });
      return cached;
    }

    // Return mock response if in mock mode
    if (this.isMockMode) {
      return this.generateMockScript({ topic, genre, duration, style });
    }

    const promptTemplate = SCRIPT_PROMPTS[genre];
    const prompt = promptTemplate
      .replace('{topic}', topic)
      .replace('{duration}', duration);

    let script, hooks, hashtags;

    if (this.openaiClient) {
      try {
        const response = await withTimeout(
          retryWithBackoff(
            () => this.generateWithOpenAI(prompt),
            { ...RETRY_PRESETS.ai, operationName: 'OpenAI Script Generation' }
          ),
          TIMEOUTS.AI_REQUEST,
          'OpenAI Script Generation'
        );
        script = response.script;
        hooks = response.hooks;
        hashtags = response.hashtags;
      } catch (openaiError) {
        this.logger.warn('OpenAI failed, trying Gemini', { error: openaiError.message });
        
        if (this.geminiClient) {
          const response = await withTimeout(
            retryWithBackoff(
              () => this.generateWithGemini(prompt),
              { ...RETRY_PRESETS.ai, operationName: 'Gemini Script Generation' }
            ),
            TIMEOUTS.AI_REQUEST,
            'Gemini Script Generation'
          );
          script = response.script;
          hooks = response.hooks;
          hashtags = response.hashtags;
        } else {
          throw openaiError;
        }
      }
    } else if (this.geminiClient) {
      const response = await withTimeout(
        retryWithBackoff(
          () => this.generateWithGemini(prompt),
          { ...RETRY_PRESETS.ai, operationName: 'Gemini Script Generation' }
        ),
        TIMEOUTS.AI_REQUEST,
        'Gemini Script Generation'
      );
      script = response.script;
      hooks = response.hooks;
      hashtags = response.hashtags;
    } else {
      throw new Error('No AI API keys configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in your .env file.');
    }

    this.logger.info('Script generated successfully', {
      topic,
      genre,
      scriptLength: script.length,
      hooksCount: hooks.length,
      hashtagsCount: hashtags.length
    });

    const result = {
      script,
      hooks,
      hashtags,
      metadata: {
        topic,
        genre,
        duration,
        style,
        generatedAt: new Date().toISOString()
      }
    };

    await this.cacheService.set(cacheKey, result, { type: 'script', topic, genre });
    return result;
  }

  async generateWithOpenAI(prompt) {
    const completion = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional content creator specializing in viral vertical video scripts.
            Respond with JSON containing: script (string), hooks (array of 3 compelling opening lines), hashtags (array of 10 relevant hashtags).`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async generateWithGemini(prompt) {
    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent([
      `${prompt}\n\nRespond with JSON containing: script (string), hooks (array of 3 compelling opening lines), hashtags (array of 10 relevant hashtags).`
    ]);

    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }
    
    return JSON.parse(jsonMatch[0]);
  }

  // Method for generating completions (used by content analyzer)
  async generateCompletion({ prompt, temperature = 0.7, maxTokens = 1000 }) {
    // Return mock response if in mock mode
    if (this.isMockMode) {
      return this.generateMockCompletion({ prompt, temperature, maxTokens });
    }

    if (!this.openaiClient && !this.geminiClient) {
      throw new Error('No AI API keys configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in your .env file.');
    }

    return withTimeout(
      retryWithBackoff(
        async () => {
          if (this.openaiClient) {
            try {
              const completion = await this.openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens: maxTokens
              });
              return completion.choices[0].message.content;
            } catch (error) {
              if (this.geminiClient) {
                this.logger.warn('OpenAI failed, trying Gemini', { error: error.message });
                const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
                const result = await model.generateContent([prompt]);
                const response = await result.response;
                return response.text();
              }
              throw error;
            }
          } else {
            // Use Gemini as primary
            const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const result = await model.generateContent([prompt]);
            const response = await result.response;
            return response.text();
          }
        },
        { ...RETRY_PRESETS.ai, operationName: 'AI Completion' }
      ),
      TIMEOUTS.AI_REQUEST,
      'AI Completion'
    );
  }

  // Mock response methods for testing without API keys
  generateMockScript({ topic, genre, duration, style }) {
    this.logger.info('Generating mock script response', { topic, genre, duration, style });
    
    const mockScript = `Welcome to this exciting ${genre} story about ${topic}! 

Did you know that ${topic} has been fascinating people for centuries? In this ${duration}-second video, we'll explore the most incredible aspects of this topic.

From the very beginning, ${topic} has captured imaginations worldwide. The story unfolds with unexpected twists and turns that will keep you on the edge of your seat.

What makes ${topic} so special? It's the perfect blend of mystery, excitement, and real-world impact that makes it unforgettable.

Join us as we dive deep into this fascinating world and discover what makes ${topic} truly remarkable!`;

    const mockHooks = [
      `What if I told you ${topic} holds secrets that could change everything?`,
      `The shocking truth about ${topic} revealed in ${duration} seconds!`,
      `You won't believe what happened with ${topic} - watch now!`
    ];

    const mockHashtags = [
      `#${topic.replaceAll(/\s+/g, '')}`, 
      `#${genre}Story`, 
      `#ViralVideo`, 
      `#ShortVideo`, 
      `#AmazingFacts`, 
      `#DidYouKnow`, 
      `#StoryTime`, 
      `#ContentCreator`, 
      `#Trending`, 
      `#MustWatch`
    ];

    const result = {
      script: mockScript,
      hooks: mockHooks,
      hashtags: mockHashtags,
      metadata: {
        topic,
        genre,
        duration,
        style,
        generatedAt: new Date().toISOString(),
        mock: true
      }
    };

    // Still cache mock responses
    const cacheKey = this.cacheService.generateKey('script', { topic, genre, duration, style });
    this.cacheService.set(cacheKey, result, { type: 'script', topic, genre });
    
    return result;
  }

  generateMockCompletion({ prompt, temperature, maxTokens }) {
    this.logger.info('Generating mock completion response', { promptLength: prompt.length, temperature, maxTokens });
    
    // Generate a mock response based on the prompt content
    const promptLower = prompt.toLowerCase();
    let mockResponse = '';
    
    if (promptLower.includes('analyze') || promptLower.includes('sentiment')) {
      mockResponse = 'This content appears to be positive and engaging, with strong emotional appeal and clear messaging that resonates with the target audience.';
    } else if (promptLower.includes('summarize') || promptLower.includes('summary')) {
      mockResponse = 'This is a comprehensive overview covering key aspects, main points, and important details that provide valuable insights into the topic.';
    } else if (promptLower.includes('recommend') || promptLower.includes('suggest')) {
      mockResponse = 'Based on the analysis, I recommend focusing on high-quality visuals, engaging storytelling, and clear calls-to-action to maximize viewer engagement.';
    } else {
      mockResponse = `Thank you for your request. This is a mock AI response generated for testing purposes. Your prompt was: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"

The mock response demonstrates how the AI service would process and respond to various types of content analysis, script generation, and recommendation requests in a development environment.`;
    }
    
    return mockResponse;
  }
}

// Factory function for dependency injection
export const createAIService = ({ logger, cacheService }) => {
  return new AIService({ logger, cacheService });
};

// Legacy export for backward compatibility
export const aiService = {
  generateScript: async (params) => {
    const service = new AIService({ 
      logger: console, 
      cacheService: { 
        generateKey: () => 'mock', 
        get: () => null, 
        set: () => {} 
      } 
    });
    return service.generateScript(params);
  }
};