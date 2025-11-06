import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoPilotService } from '../../apps/orchestrator/src/services/autoPilotService.js';

describe('AutoPilotService Unit Tests', () => {
  let service;
  let mockAiService;
  let mockPipelineService;
  let mockContentAnalyzerService;
  let mockSmartAssetRecommenderService;
  let mockLogger;

  beforeEach(() => {
    mockAiService = {
      generateScript: vi.fn().mockResolvedValue({
        script: { content: 'Test script', genre: 'horror', duration: 60 }
      })
    };

    mockPipelineService = {
      build: vi.fn().mockResolvedValue({ success: true })
    };

    mockContentAnalyzerService = {
      analyzeScript: vi.fn().mockResolvedValue({
        analysis: { engagementScore: 8, hookStrength: 7, pacing: 'medium' }
      })
    };

    mockSmartAssetRecommenderService = {
      getRecommendations: vi.fn().mockResolvedValue({
        recommendations: {
          backgrounds: { local: [{ name: 'bg.mp4', path: '/bg.mp4' }] },
          music: [{ name: 'music.mp3', path: '/music.mp3' }],
          sfx: []
        }
      })
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    service = new AutoPilotService({
      aiService: mockAiService,
      pipelineService: mockPipelineService,
      contentAnalyzerService: mockContentAnalyzerService,
      smartAssetRecommenderService: mockSmartAssetRecommenderService,
      logger: mockLogger
    });
  });

  describe('createVideo', () => {
    it('should create video successfully', async () => {
      const result = await service.createVideo({
        topic: 'Test topic',
        genre: 'horror',
        duration: 60
      });

      expect(result.success).toBe(true);
      expect(result.jobId).toBeDefined();
      expect(result.video).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should use fallback when AI fails', async () => {
      mockAiService.generateScript.mockRejectedValue(new Error('AI failed'));

      const result = await service.createVideo({
        topic: 'Test topic',
        genre: 'horror'
      });

      expect(result.success).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('fallback'),
        expect.any(Object)
      );
    });

    it('should track progress through all steps', async () => {
      await service.createVideo({
        topic: 'Test',
        genre: 'horror'
      });

      const progressCalls = mockLogger.info.mock.calls.filter(
        call => call[0] === 'Auto-pilot progress'
      );

      expect(progressCalls.length).toBeGreaterThan(5);
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const createResult = await service.createVideo({
        topic: 'Test',
        genre: 'horror'
      });

      const status = service.getJobStatus(createResult.jobId);

      expect(status.success).toBe(true);
      expect(status.job).toBeDefined();
      expect(status.job.id).toBe(createResult.jobId);
      expect(status.job.status).toBeDefined();
    });

    it('should return error for non-existent job', () => {
      const status = service.getJobStatus('invalid-id');

      expect(status.success).toBe(false);
      expect(status.error).toBeDefined();
    });
  });

  describe('Fallback Logic', () => {
    it('should use template script when AI fails', async () => {
      mockAiService.generateScript.mockRejectedValue(new Error('Failed'));

      const result = await service.createVideo({
        topic: 'Test',
        genre: 'horror'
      });

      expect(result.success).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should use default analysis when analyzer fails', async () => {
      mockContentAnalyzerService.analyzeScript.mockRejectedValue(new Error('Failed'));

      const result = await service.createVideo({
        topic: 'Test',
        genre: 'horror'
      });

      expect(result.success).toBe(true);
    });

    it('should use default assets when recommender fails', async () => {
      mockSmartAssetRecommenderService.getRecommendations.mockRejectedValue(new Error('Failed'));

      const result = await service.createVideo({
        topic: 'Test',
        genre: 'horror'
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Job Management', () => {
    it('should track multiple concurrent jobs', async () => {
      const jobs = await Promise.all([
        service.createVideo({ topic: 'Job 1', genre: 'horror' }),
        service.createVideo({ topic: 'Job 2', genre: 'mystery' }),
        service.createVideo({ topic: 'Job 3', genre: 'horror' })
      ]);

      expect(jobs.length).toBe(3);
      expect(jobs.every(j => j.success)).toBe(true);
      
      const jobIds = jobs.map(j => j.jobId);
      const uniqueIds = new Set(jobIds);
      expect(uniqueIds.size).toBe(3);
    });

    it('should maintain job state', async () => {
      const result = await service.createVideo({
        topic: 'Test',
        genre: 'horror'
      });

      const status = service.getJobStatus(result.jobId);
      
      expect(status.job.status).toBe('complete');
      expect(status.job.progress).toBe(100);
      expect(status.job.steps.length).toBeGreaterThan(0);
    });
  });
});
