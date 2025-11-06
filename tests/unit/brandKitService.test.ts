import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandKitService } from '../../apps/orchestrator/src/services/brandKitService.js';

describe('BrandKitService', () => {
  let brandKitService: any;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };
    brandKitService = new BrandKitService({ logger: mockLogger });
    vi.clearAllMocks();
  });

  describe('service initialization', () => {
    it('initializes with correct directory paths', () => {
      expect(brandKitService.brandsDir).toBeDefined();
      expect(brandKitService.brandsConfigDir).toBeDefined();
      expect(brandKitService.brandAssetsDir).toBeDefined();
    });

    it('has ffmpegService injected', () => {
      expect(brandKitService.ffmpegService).toBeDefined();
    });
  });

  describe('getAllBrandKits', () => {
    it('returns empty array when no brand kits exist', async () => {
      const kits = await brandKitService.getAllBrandKits();
      
      expect(Array.isArray(kits)).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting all brand kits',
        expect.any(Object)
      );
    });

    it('accepts search options', async () => {
      await brandKitService.getAllBrandKits({ search: 'test' });
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting all brand kits',
        expect.objectContaining({ search: 'test' })
      );
    });
  });

  describe('getBrandKitById', () => {
    it('throws error when brand kit not found', async () => {
      await expect(brandKitService.getBrandKitById('non-existent')).rejects.toThrow('Brand kit not found');
    });

    it('logs the brand kit ID request', async () => {
      try {
        await brandKitService.getBrandKitById('test-id');
      } catch {
        // Expected to fail
      }
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting brand kit by ID',
        expect.objectContaining({ brandKitId: 'test-id' })
      );
    });
  });

  describe('createBrandKit', () => {
    it('creates brand kit with default values', async () => {
      const brandData = {
        name: 'Test Brand'
      };

      const result = await brandKitService.createBrandKit(brandData);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^brand-/);
      expect(result.name).toBe('Test Brand');
      expect(result.colors).toBeDefined();
      expect(result.fonts).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Brand kit created',
        expect.any(Object)
      );
    });

    it('applies custom colors when provided', async () => {
      const brandData = {
        name: 'Custom Brand',
        colors: {
          primary: '#FF5733',
          secondary: '#33FF57'
        }
      };

      const result = await brandKitService.createBrandKit(brandData);

      expect(result.colors.primary).toBe('#FF5733');
      expect(result.colors.secondary).toBe('#33FF57');
    });

    it('applies custom fonts when provided', async () => {
      const brandData = {
        name: 'Font Brand',
        fonts: {
          primary: 'Arial',
          secondary: 'Helvetica'
        }
      };

      const result = await brandKitService.createBrandKit(brandData);

      expect(result.fonts.primary).toBe('Arial');
      expect(result.fonts.secondary).toBe('Helvetica');
    });
  });
});
