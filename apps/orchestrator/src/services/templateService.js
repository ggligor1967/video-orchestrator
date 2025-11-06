import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * Template Service
 *
 * Manages video templates that combine pre-configured settings for
 * script generation, background selection, voice-over, captions, and export.
 * Enables one-click video creation from templates.
 *
 * Features:
 * - Pre-built templates for different genres
 * - Custom template creation and management
 * - Template categories and tags
 * - One-click video creation from template
 * - Template import/export
 */
export class TemplateService {
  constructor({ logger, pipelineService, brandKitService }) {
    this.logger = logger;
    this.pipelineService = pipelineService;
    this.brandKitService = brandKitService;

    // Template storage directory
    this.templatesDir = path.join(process.cwd(), 'data', 'templates');

    // Pre-built templates
    this.builtInTemplates = this.createBuiltInTemplates();

    // Initialize template directory
    this.initializeTemplatesDir();
  }

  async initializeTemplatesDir() {
    try {
      await fs.mkdir(this.templatesDir, { recursive: true });
      this.logger.info('Template directory initialized', {
        templatesDir: this.templatesDir
      });
    } catch (error) {
      this.logger.error('Failed to create templates directory', {
        error: error.message
      });
    }
  }

  /**
   * Create pre-built templates for different genres and use cases
   */
  createBuiltInTemplates() {
    return {
      'horror-story-30s': {
        id: 'horror-story-30s',
        name: 'Horror Story 30s',
        description: 'Short horror story with atmospheric background and dramatic captions',
        category: 'horror',
        tags: ['horror', 'story', 'short', 'tiktok'],
        thumbnail: '/static/template-previews/horror-story-30s.png',
        duration: 30,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'horror',
          style: 'story',
          duration: 30,
          topic: null // User must provide topic
        },

        backgroundSettings: {
          type: 'stock', // 'stock' or 'upload'
          stockQuery: 'dark forest night haunted',
          orientation: 'portrait',
          autoSelect: true // Automatically select best match
        },

        voiceSettings: {
          voice: 'en_US-hfc_male-medium',
          speed: 0.95,
          pitch: 0.9 // Slightly lower for dramatic effect
        },

        captionStyle: 'tiktok-trending',

        audioSettings: {
          backgroundMusic: null, // Optional background music
          volume: 0.3,
          normalize: true,
          lufs: -16
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'center',
          speedRamp: false
        },

        exportPreset: 'tiktok'
      },

      'horror-story-60s': {
        id: 'horror-story-60s',
        name: 'Horror Story 60s',
        description: 'Medium-length horror story with cinematic feel',
        category: 'horror',
        tags: ['horror', 'story', 'medium', 'youtube'],
        thumbnail: '/static/template-previews/horror-story-60s.png',
        duration: 60,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'horror',
          style: 'story',
          duration: 60,
          topic: null
        },

        backgroundSettings: {
          type: 'stock',
          stockQuery: 'abandoned building creepy atmosphere',
          orientation: 'portrait',
          autoSelect: true
        },

        voiceSettings: {
          voice: 'en_US-hfc_male-medium',
          speed: 1.0,
          pitch: 0.9
        },

        captionStyle: 'bold-impact',

        audioSettings: {
          backgroundMusic: null,
          volume: 0.25,
          normalize: true,
          lufs: -16
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'motion',
          speedRamp: true,
          speedRampStart: 2
        },

        exportPreset: 'youtube'
      },

      'mystery-investigation-60s': {
        id: 'mystery-investigation-60s',
        name: 'Mystery Investigation 60s',
        description: 'Investigative mystery story with noir aesthetic',
        category: 'mystery',
        tags: ['mystery', 'investigation', 'noir', 'detective'],
        thumbnail: '/static/template-previews/mystery-investigation-60s.png',
        duration: 60,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'mystery',
          style: 'story',
          duration: 60,
          topic: null
        },

        backgroundSettings: {
          type: 'stock',
          stockQuery: 'detective noir investigation dark',
          orientation: 'portrait',
          autoSelect: true
        },

        voiceSettings: {
          voice: 'en_US-lessac-medium',
          speed: 1.0,
          pitch: 1.0
        },

        captionStyle: 'minimal',

        audioSettings: {
          backgroundMusic: null,
          volume: 0.3,
          normalize: true,
          lufs: -16
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'center',
          speedRamp: false
        },

        exportPreset: 'instagram'
      },

      'true-crime-45s': {
        id: 'true-crime-45s',
        name: 'True Crime 45s',
        description: 'True crime story with documentary-style presentation',
        category: 'true-crime',
        tags: ['true-crime', 'documentary', 'crime', 'investigation'],
        thumbnail: '/static/template-previews/true-crime-45s.png',
        duration: 45,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'true crime',
          style: 'story',
          duration: 45,
          topic: null
        },

        backgroundSettings: {
          type: 'stock',
          stockQuery: 'police crime scene investigation',
          orientation: 'portrait',
          autoSelect: true
        },

        voiceSettings: {
          voice: 'en_US-hfc_male-medium',
          speed: 1.05,
          pitch: 1.0
        },

        captionStyle: 'classic',

        audioSettings: {
          backgroundMusic: null,
          volume: 0.25,
          normalize: true,
          lufs: -16
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'face',
          speedRamp: false
        },

        exportPreset: 'tiktok'
      },

      'paranormal-30s': {
        id: 'paranormal-30s',
        name: 'Paranormal Encounter 30s',
        description: 'Supernatural story with eerie atmosphere',
        category: 'paranormal',
        tags: ['paranormal', 'supernatural', 'ghost', 'spirit'],
        thumbnail: '/static/template-previews/paranormal-30s.png',
        duration: 30,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'paranormal',
          style: 'story',
          duration: 30,
          topic: null
        },

        backgroundSettings: {
          type: 'stock',
          stockQuery: 'ghost supernatural eerie mist',
          orientation: 'portrait',
          autoSelect: true
        },

        voiceSettings: {
          voice: 'en_US-hfc_female-medium',
          speed: 0.9,
          pitch: 0.95
        },

        captionStyle: 'neon-glow',

        audioSettings: {
          backgroundMusic: null,
          volume: 0.3,
          normalize: true,
          lufs: -16
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'center',
          speedRamp: false
        },

        exportPreset: 'tiktok'
      },

      'quick-facts-15s': {
        id: 'quick-facts-15s',
        name: 'Quick Facts 15s',
        description: 'Fast-paced fact presentation for viral content',
        category: 'educational',
        tags: ['facts', 'educational', 'quick', 'viral'],
        thumbnail: '/static/template-previews/quick-facts-15s.png',
        duration: 15,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'mystery',
          style: 'facts',
          duration: 15,
          topic: null
        },

        backgroundSettings: {
          type: 'stock',
          stockQuery: 'abstract colorful dynamic',
          orientation: 'portrait',
          autoSelect: true
        },

        voiceSettings: {
          voice: 'en_US-lessac-medium',
          speed: 1.2,
          pitch: 1.05
        },

        captionStyle: 'karaoke',

        audioSettings: {
          backgroundMusic: null,
          volume: 0.2,
          normalize: true,
          lufs: -14
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'center',
          speedRamp: true,
          speedRampStart: 1
        },

        exportPreset: 'tiktok'
      },

      'motivational-quote-20s': {
        id: 'motivational-quote-20s',
        name: 'Motivational Quote 20s',
        description: 'Inspirational quote with uplifting visuals',
        category: 'motivational',
        tags: ['motivational', 'quote', 'inspiration', 'positive'],
        thumbnail: '/static/template-previews/motivational-quote-20s.png',
        duration: 20,
        isBuiltIn: true,

        scriptSettings: {
          genre: 'motivational',
          style: 'quote',
          duration: 20,
          topic: null
        },

        backgroundSettings: {
          type: 'stock',
          stockQuery: 'sunrise mountains inspiring nature',
          orientation: 'portrait',
          autoSelect: true
        },

        voiceSettings: {
          voice: 'en_US-hfc_female-medium',
          speed: 0.95,
          pitch: 1.1
        },

        captionStyle: 'bold-impact',

        audioSettings: {
          backgroundMusic: null,
          volume: 0.3,
          normalize: true,
          lufs: -16
        },

        videoSettings: {
          autoReframe: true,
          detectionMode: 'center',
          speedRamp: false
        },

        exportPreset: 'instagram'
      }
    };
  }

  /**
   * Get all templates (built-in + custom)
   */
  async getAllTemplates(options = {}) {
    const { category, tags, search } = options;

    this.logger.info('Getting all templates', { category, tags, search });

    try {
      // Get built-in templates
      let templates = Object.values(this.builtInTemplates);

      // Get custom templates from disk
      try {
        const files = await fs.readdir(this.templatesDir);
        const customTemplates = await Promise.all(
          files
            .filter(file => file.endsWith('.json'))
            .map(async file => {
              const content = await fs.readFile(
                path.join(this.templatesDir, file),
                'utf-8'
              );
              return JSON.parse(content);
            })
        );
        templates = [...templates, ...customTemplates];
      } catch (_error) {
        // No custom templates yet, that's fine
      }

      // Apply filters
      if (category) {
        templates = templates.filter(t => t.category === category);
      }

      if (tags && tags.length > 0) {
        templates = templates.filter(t =>
          tags.some(tag => t.tags.includes(tag))
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        templates = templates.filter(t =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      this.logger.info('Templates retrieved', {
        total: templates.length,
        filtered: templates.length
      });

      return templates;

    } catch (error) {
      this.logger.error('Failed to get templates', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId) {
    this.logger.info('Getting template by ID', { templateId });

    // Check built-in templates first
    if (this.builtInTemplates[templateId]) {
      return this.builtInTemplates[templateId];
    }

    // Check custom templates
    try {
      const filePath = path.join(this.templatesDir, `${templateId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (_error) {
      throw new Error(`Template not found: ${templateId}`);
    }
  }

  /**
   * Get all template categories
   */
  getCategories() {
    const templates = Object.values(this.builtInTemplates);
    const categories = [...new Set(templates.map(t => t.category))];

    return categories.map(category => ({
      id: category,
      name: this.formatCategoryName(category),
      count: templates.filter(t => t.category === category).length
    }));
  }

  /**
   * Get all template tags
   */
  getTags() {
    const templates = Object.values(this.builtInTemplates);
    const allTags = templates.flatMap(t => t.tags);
    const uniqueTags = [...new Set(allTags)];

    return uniqueTags.map(tag => ({
      id: tag,
      name: this.formatTagName(tag),
      count: templates.filter(t => t.tags.includes(tag)).length
    }));
  }

  /**
   * Create custom template
   */
  async createTemplate(templateData) {
    const template = {
      id: `custom-${uuid()}`,
      name: templateData.name,
      description: templateData.description || '',
      category: templateData.category || 'custom',
      tags: templateData.tags || [],
      thumbnail: templateData.thumbnail || null,
      duration: templateData.duration,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),

      scriptSettings: templateData.scriptSettings,
      backgroundSettings: templateData.backgroundSettings,
      voiceSettings: templateData.voiceSettings,
      captionStyle: templateData.captionStyle,
      audioSettings: templateData.audioSettings,
      videoSettings: templateData.videoSettings,
      exportPreset: templateData.exportPreset
    };

    this.logger.info('Creating custom template', {
      templateId: template.id,
      name: template.name
    });

    try {
      // Save to disk
      const filePath = path.join(this.templatesDir, `${template.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(template, null, 2), 'utf-8');

      this.logger.info('Custom template created', {
        templateId: template.id,
        filePath
      });

      return template;

    } catch (error) {
      this.logger.error('Failed to create template', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update custom template
   */
  async updateTemplate(templateId, updates) {
    this.logger.info('Updating template', { templateId });

    // Cannot update built-in templates
    if (this.builtInTemplates[templateId]) {
      throw new Error('Cannot update built-in templates');
    }

    try {
      // Get existing template
      const template = await this.getTemplateById(templateId);

      // Apply updates
      const updatedTemplate = {
        ...template,
        ...updates,
        id: templateId, // Ensure ID doesn't change
        isBuiltIn: false,
        updatedAt: new Date().toISOString()
      };

      // Save to disk
      const filePath = path.join(this.templatesDir, `${templateId}.json`);
      await fs.writeFile(
        filePath,
        JSON.stringify(updatedTemplate, null, 2),
        'utf-8'
      );

      this.logger.info('Template updated', { templateId });

      return updatedTemplate;

    } catch (error) {
      this.logger.error('Failed to update template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Delete custom template
   */
  async deleteTemplate(templateId) {
    this.logger.info('Deleting template', { templateId });

    // Cannot delete built-in templates
    if (this.builtInTemplates[templateId]) {
      throw new Error('Cannot delete built-in templates');
    }

    try {
      const filePath = path.join(this.templatesDir, `${templateId}.json`);
      await fs.unlink(filePath);

      this.logger.info('Template deleted', { templateId });

      return { deleted: true };

    } catch (error) {
      this.logger.error('Failed to delete template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Apply template - Create video from template
   */
  async applyTemplate(templateId, customizations = {}) {
    this.logger.info('Applying template', { templateId, customizations });

    try {
      // Get template
      const template = await this.getTemplateById(templateId);

      // Validate required customizations
      if (!customizations.topic && template.scriptSettings.topic === null) {
        throw new Error('Topic is required for this template');
      }

      // Get brand kit if specified
      let brandKit = null;
      if (customizations.brandKitId) {
        this.logger.info('Loading brand kit for template', {
          brandKitId: customizations.brandKitId
        });
        brandKit = await this.brandKitService.getBrandKitById(customizations.brandKitId);
      }

      // Build pipeline configuration from template
      const pipelineConfig = {
        // Script generation
        script: {
          topic: customizations.topic || template.scriptSettings.topic,
          genre: customizations.genre || template.scriptSettings.genre,
          style: template.scriptSettings.style,
          duration: customizations.duration || template.duration
        },

        // Background selection
        background: customizations.backgroundPath ? {
          type: 'upload',
          path: customizations.backgroundPath
        } : {
          type: 'stock',
          query: template.backgroundSettings.stockQuery,
          autoSelect: template.backgroundSettings.autoSelect
        },

        // Voice settings - use brand kit defaults if available
        voice: {
          voice: customizations.voice || brandKit?.defaults?.voice || template.voiceSettings.voice,
          speed: customizations.speed || template.voiceSettings.speed,
          pitch: template.voiceSettings.pitch
        },

        // Caption styling - use brand kit defaults if available
        captions: {
          style: customizations.captionStyle || brandKit?.defaults?.captionStyle || template.captionStyle
        },

        // Audio settings - use brand kit music if available
        audio: {
          ...template.audioSettings,
          backgroundMusic: brandKit ? this.brandKitService.getRandomMusic(brandKit) : template.audioSettings.backgroundMusic,
          volume: brandKit?.defaults?.musicVolume || template.audioSettings.volume
        },

        // Video processing
        video: template.videoSettings,

        // Export - use brand kit defaults if available
        export: {
          preset: customizations.exportPreset || brandKit?.defaults?.exportPreset || template.exportPreset
        },

        // Brand kit for post-processing
        brandKit: brandKit
      };

      this.logger.info('Pipeline configuration built from template', {
        templateId,
        hasBrandKit: !!brandKit,
        config: pipelineConfig
      });

      // Execute pipeline
      const result = await this.pipelineService.buildVideo(pipelineConfig);

      // Apply brand kit to final video if specified
      let finalOutputPath = result.outputPath;
      if (brandKit && result.outputPath) {
        this.logger.info('Applying brand kit to final video', {
          brandKitId: customizations.brandKitId,
          videoPath: result.outputPath
        });

        try {
          const brandedResult = await this.brandKitService.applyBrandKit(
            customizations.brandKitId,
            result.outputPath
          );
          finalOutputPath = brandedResult.outputPath;

          this.logger.info('Brand kit applied to video', {
            originalPath: result.outputPath,
            brandedPath: finalOutputPath
          });
        } catch (brandError) {
          this.logger.error('Failed to apply brand kit, using original video', {
            error: brandError.message,
            brandKitId: customizations.brandKitId
          });
          // Continue with original video if branding fails
        }
      }

      this.logger.info('Template applied successfully', {
        templateId,
        jobId: result.jobId,
        hasBrandKit: !!brandKit
      });

      return {
        success: true,
        templateId,
        brandKitId: customizations.brandKitId || null,
        jobId: result.jobId,
        status: result.status,
        outputPath: finalOutputPath
      };

    } catch (error) {
      this.logger.error('Failed to apply template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Duplicate template (create copy)
   */
  async duplicateTemplate(templateId, newName) {
    this.logger.info('Duplicating template', { templateId, newName });

    try {
      const template = await this.getTemplateById(templateId);

      // Remove built-in flag and create new ID
      const duplicatedTemplate = {
        ...template,
        id: `custom-${uuid()}`,
        name: newName || `${template.name} (Copy)`,
        isBuiltIn: false,
        createdAt: new Date().toISOString()
      };

      // Save as custom template
      const filePath = path.join(
        this.templatesDir,
        `${duplicatedTemplate.id}.json`
      );
      await fs.writeFile(
        filePath,
        JSON.stringify(duplicatedTemplate, null, 2),
        'utf-8'
      );

      this.logger.info('Template duplicated', {
        originalId: templateId,
        newId: duplicatedTemplate.id
      });

      return duplicatedTemplate;

    } catch (error) {
      this.logger.error('Failed to duplicate template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Export template to JSON file
   */
  async exportTemplate(templateId) {
    const template = await this.getTemplateById(templateId);
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  async importTemplate(templateJson) {
    const template = JSON.parse(templateJson);

    // Assign new ID and mark as custom
    const importedTemplate = {
      ...template,
      id: `custom-${uuid()}`,
      isBuiltIn: false,
      createdAt: new Date().toISOString()
    };

    return await this.createTemplate(importedTemplate);
  }

  // Helper methods

  formatCategoryName(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatTagName(tag) {
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
