/**
 * Service Dependency Validator
 * 
 * Validates that services have their required dependencies available
 * before operations are performed. This prevents runtime errors from
 * missing or invalid cross-service dependencies.
 */

import { logger } from '../utils/logger.js';

export class ServiceDependencyValidator {
  constructor() {
    this.dependencies = {
      // videoService dependencies
      video: {
        mergeWithAudio: ['audio'],  // Needs audio files
        mergeVideoAudio: ['audio']  // Needs audio files
      },
      
      // audioService dependencies
      audio: {
        mixAudio: [],  // Can work standalone
        normalizeAudio: []  // Can work standalone
      },
      
      // subsService dependencies
      subs: {
        generateSubtitles: ['audio'],  // Needs audio for transcription
        extractFromVideo: ['video']     // Needs video source
      },
      
      // ttsService dependencies
      tts: {
        generate: [],  // Can work standalone (text input only)
      },
      
      // exportService dependencies
      export: {
        compileVideo: ['video', 'audio', 'subs'],  // Needs all components
      },
      
      // pipelineService dependencies
      pipeline: {
        buildCompleteVideo: ['video', 'audio', 'tts', 'subs', 'export']  // Orchestrates all
      }
    };
  }

  /**
   * Validates that required dependencies are available
   * @param {string} service - Service name (e.g., 'video', 'audio')
   * @param {string} operation - Operation name (e.g., 'mergeWithAudio')
   * @param {Object} inputs - Input parameters to validate
   * @returns {Promise<{valid: boolean, errors: string[]}>}
   */
  async validate(service, operation, inputs) {
    const errors = [];
    
    const deps = this.dependencies[service]?.[operation] || [];
    
    for (const dep of deps) {
      const result = await this.validateDependency(dep, inputs);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a specific dependency type
   * @param {string} depType - Dependency type ('audio', 'video', 'subs')
   * @param {Object} inputs - Input parameters
   * @returns {Promise<{valid: boolean, errors: string[]}>}
   */
  async validateDependency(depType, inputs) {
    const errors = [];
    
    switch (depType) {
      case 'audio':
        if (!inputs.audioPath && !inputs.audioId && !inputs.tracks) {
          errors.push('Audio dependency missing: audioPath, audioId, or tracks required');
        }
        break;
        
      case 'video':
        if (!inputs.videoPath && !inputs.backgroundId) {
          errors.push('Video dependency missing: videoPath or backgroundId required');
        }
        break;
        
      case 'subs':
        if (!inputs.subtitleId && !inputs.subtitlePath) {
          errors.push('Subtitle dependency missing: subtitleId or subtitlePath required');
        }
        break;
        
      case 'tts':
        if (!inputs.text && !inputs.script) {
          errors.push('TTS dependency missing: text or script required');
        }
        break;
        
      case 'export':
        // Export needs compiled video components
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets the recommended service initialization order
   * @returns {string[]} - Ordered list of service names
   */
  getInitializationOrder() {
    return [
      'assets',    // Load assets first (backgrounds, etc.)
      'tts',       // Generate voice-over (independent)
      'audio',     // Process audio (may need TTS output)
      'video',     // Process video (may need audio for muxing)
      'subs',      // Generate subtitles (needs audio)
      'export',    // Compile final video (needs all above)
      'pipeline'   // Orchestration layer (coordinates all)
    ];
  }

  /**
   * Validates pipeline execution order
   * @param {Array} stages - Ordered array of pipeline stages
   * @returns {{valid: boolean, warnings: string[]}}
   */
  validatePipelineOrder(stages) {
    const warnings = [];
    const order = this.getInitializationOrder();
    const stageIndices = {};
    
    // Map stage names to their positions
    stages.forEach((stage, idx) => {
      stageIndices[stage] = idx;
    });
    
    // Check if stages follow recommended order
    for (let i = 0; i < order.length - 1; i++) {
      const current = order[i];
      const next = order[i + 1];
      
      if (stageIndices[current] !== undefined && 
          stageIndices[next] !== undefined &&
          stageIndices[current] > stageIndices[next]) {
        warnings.push(
          `Pipeline stage '${next}' should come after '${current}' for optimal dependency resolution`
        );
      }
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Logs dependency validation results
   * @param {string} service - Service name
   * @param {string} operation - Operation name
   * @param {Object} validation - Validation result
   */
  logValidation(service, operation, validation) {
    if (!validation.valid) {
      logger.warn('Service dependency validation failed', {
        service,
        operation,
        errors: validation.errors
      });
    } else {
      logger.debug('Service dependency validation passed', {
        service,
        operation
      });
    }
  }
}

// Singleton instance
export const serviceDependencyValidator = new ServiceDependencyValidator();
