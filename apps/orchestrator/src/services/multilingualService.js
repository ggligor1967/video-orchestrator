import { logger } from '../utils/logger.js';

const LANGUAGES = {
  en: { name: 'English', code: 'en', flag: '🇬🇧' },
  ro: { name: 'Romanian', code: 'ro', flag: '🇷🇴' },
  es: { name: 'Spanish', code: 'es', flag: '🇪🇸' },
  fr: { name: 'French', code: 'fr', flag: '🇫🇷' },
  de: { name: 'German', code: 'de', flag: '🇩🇪' },
  pt: { name: 'Portuguese', code: 'pt', flag: '🇵🇹' },
  it: { name: 'Italian', code: 'it', flag: '🇮🇹' },
  pl: { name: 'Polish', code: 'pl', flag: '🇵🇱' },
  nl: { name: 'Dutch', code: 'nl', flag: '🇳🇱' }
};

const CULTURAL_CONTEXT = {
  en: { humor: 'sarcastic', formality: 'casual', references: 'pop-culture' },
  ro: { humor: 'dark', formality: 'casual', references: 'local-folklore' },
  es: { humor: 'warm', formality: 'friendly', references: 'family-oriented' },
  fr: { humor: 'sophisticated', formality: 'formal', references: 'artistic' },
  de: { humor: 'direct', formality: 'formal', references: 'efficiency' },
  pt: { humor: 'warm', formality: 'casual', references: 'music-dance' },
  it: { humor: 'expressive', formality: 'casual', references: 'food-family' },
  pl: { humor: 'witty', formality: 'formal', references: 'history' },
  nl: { humor: 'direct', formality: 'casual', references: 'practical' }
};

export class MultilingualService {
  constructor({ aiService, logger: log }) {
    this.aiService = aiService;
    this.logger = log;
  }

  getSupportedLanguages() {
    return Object.values(LANGUAGES);
  }

  async generateMultilingualContent(content, languages) {
    const results = {};

    for (const lang of languages) {
      const cultural = CULTURAL_CONTEXT[lang] || CULTURAL_CONTEXT.en;
      results[lang] = {
        script: await this.adaptScript(content.script, lang, cultural),
        hashtags: this.adaptHashtags(content.hashtags || [], lang),
        cultural,
        language: LANGUAGES[lang]
      };
    }

    this.logger.info('Multilingual content generated', { languages: languages.length });
    return results;
  }

  async adaptScript(script, lang, cultural) {
    // Simple adaptation - in production use AI translation
    const adaptations = {
      en: script,
      ro: `[RO] ${script}`,
      es: `[ES] ${script}`,
      fr: `[FR] ${script}`,
      de: `[DE] ${script}`,
      pt: `[PT] ${script}`,
      it: `[IT] ${script}`,
      pl: `[PL] ${script}`,
      nl: `[NL] ${script}`
    };

    return adaptations[lang] || script;
  }

  adaptHashtags(hashtags, lang) {
    const langTags = {
      en: ['#viral', '#trending'],
      ro: ['#viral', '#romania'],
      es: ['#viral', '#español'],
      fr: ['#viral', '#france'],
      de: ['#viral', '#deutschland'],
      pt: ['#viral', '#portugal'],
      it: ['#viral', '#italia'],
      pl: ['#viral', '#polska'],
      nl: ['#viral', '#nederland']
    };

    return [...hashtags, ...(langTags[lang] || langTags.en)];
  }
}
