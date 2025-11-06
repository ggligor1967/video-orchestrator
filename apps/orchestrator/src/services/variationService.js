import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger.js';

export class VariationService {
  constructor({ aiService, logger: log }) {
    this.aiService = aiService;
    this.logger = log;
  }

  async generateVariations(baseProject, options = {}) {
    const { count = 3, types = ['hook', 'pacing', 'ending'] } = options;
    const variations = [];

    try {
      // Hook variations
      if (types.includes('hook')) {
        const hooks = await this.generateHookVariations(baseProject.script, Math.min(count, 3));
        hooks.forEach((hook, i) => {
          variations.push({
            id: uuid(),
            type: 'hook',
            name: `Hook Variation ${i + 1}`,
            script: this.replaceHook(baseProject.script, hook),
            hook,
            ...baseProject
          });
        });
      }

      // Pacing variations
      if (types.includes('pacing') && variations.length < count) {
        const pacings = ['fast', 'normal', 'slow'];
        pacings.slice(0, count - variations.length).forEach(pacing => {
          variations.push({
            id: uuid(),
            type: 'pacing',
            name: `${pacing.charAt(0).toUpperCase() + pacing.slice(1)} Pacing`,
            pacing,
            speed: pacing === 'fast' ? 1.2 : pacing === 'slow' ? 0.8 : 1.0,
            ...baseProject
          });
        });
      }

      // Ending variations
      if (types.includes('ending') && variations.length < count) {
        const endings = await this.generateEndingVariations(baseProject.script, Math.min(count - variations.length, 2));
        endings.forEach((ending, i) => {
          variations.push({
            id: uuid(),
            type: 'ending',
            name: `Ending Variation ${i + 1}`,
            script: this.replaceEnding(baseProject.script, ending),
            ending,
            ...baseProject
          });
        });
      }

      this.logger.info('Variations generated', { count: variations.length, types });
      return variations.slice(0, count);

    } catch (error) {
      this.logger.error('Failed to generate variations', { error: error.message });
      throw error;
    }
  }

  async generateHookVariations(script, count = 3) {
    const firstSentence = script.split(/[.!?]/)[0];
    
    // Simple variations without AI
    const variations = [
      `What if I told you ${firstSentence.toLowerCase()}?`,
      `You won't believe this: ${firstSentence}`,
      `This will shock you. ${firstSentence}`
    ];

    return variations.slice(0, count);
  }

  async generateEndingVariations(script, count = 2) {
    return [
      'Follow for part 2!',
      'Comment if you want more stories like this!'
    ].slice(0, count);
  }

  replaceHook(script, newHook) {
    const sentences = script.split(/[.!?]/);
    sentences[0] = newHook;
    return sentences.join('. ').replace(/\.\s*\./g, '.');
  }

  replaceEnding(script, newEnding) {
    const sentences = script.split(/[.!?]/).filter(Boolean);
    sentences[sentences.length - 1] = newEnding;
    return sentences.join('. ') + '.';
  }
}
