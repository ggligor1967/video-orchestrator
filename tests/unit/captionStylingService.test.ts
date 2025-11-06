import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CaptionStylingService } from '../../apps/orchestrator/src/services/captionStylingService.js';

describe('CaptionStylingService', () => {
  let captionStylingService: any;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };
    captionStylingService = new CaptionStylingService({ logger: mockLogger });
    vi.clearAllMocks();
  });

  describe('service initialization', () => {
    it('initializes with style presets', () => {
      expect(captionStylingService.presets).toBeDefined();
      expect(typeof captionStylingService.presets).toBe('object');
    });

    it('has ffmpegService injected', () => {
      expect(captionStylingService.ffmpegService).toBeDefined();
    });

    it('includes tiktok-trending preset', () => {
      const preset = captionStylingService.presets['tiktok-trending'];
      expect(preset).toBeDefined();
      expect(preset.id).toBe('tiktok-trending');
      expect(preset.name).toBe('TikTok Trending');
      expect(preset.animation).toBe('word-by-word');
    });

    it('includes minimal preset', () => {
      const preset = captionStylingService.presets['minimal'];
      expect(preset).toBeDefined();
      expect(preset.id).toBe('minimal');
      expect(preset.animation).toBe('fade-in');
      expect(preset.background.enabled).toBe(false);
    });
  });

  describe('getPreset', () => {
    it('returns preset by ID', () => {
      const preset = captionStylingService.getPreset('tiktok-trending');
      
      expect(preset).toBeDefined();
      expect(preset.id).toBe('tiktok-trending');
    });

    it('throws error for non-existent preset', () => {
      expect(() => {
        captionStylingService.getPreset('non-existent');
      }).toThrow('Preset not found');
    });
  });

  describe('preset validation', () => {
    it('each preset has required fields', () => {
      const presets = Object.values(captionStylingService.presets);
      
      expect(presets.length).toBeGreaterThan(0);
      presets.forEach((preset: any) => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('animation');
        expect(preset).toHaveProperty('font');
        expect(preset).toHaveProperty('position');
        expect(preset).toHaveProperty('timing');
      });
    });
  });

  describe('animation options', () => {
    it('supports word-by-word animation', () => {
      const preset = captionStylingService.presets['tiktok-trending'];
      expect(preset.animation).toBe('word-by-word');
      expect(preset.timing.wordDelay).toBeDefined();
    });

    it('supports fade-in animation', () => {
      const preset = captionStylingService.presets['minimal'];
      expect(preset.animation).toBe('fade-in');
      expect(preset.timing.fadeIn).toBeDefined();
    });
  });
});
