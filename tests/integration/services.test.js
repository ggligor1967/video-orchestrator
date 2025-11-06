import { describe, it, expect, beforeAll } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';

describe('Service Integration Tests', () => {
  let container;
  let services;

  beforeAll(() => {
    container = createContainer({
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {}
      }
    });

    services = {
      ai: container.resolve('aiService'),
      tts: container.resolve('ttsService'),
      video: container.resolve('videoService'),
      subtitle: container.resolve('subsService'),
      batch: container.resolve('batchService')
    };
  });

  it('should generate AI script', async () => {
    const result = await services.ai.generateScript({
      topic: 'mysterious forest',
      genre: 'horror',
      duration: 60
    });

    expect(result.script).toBeTruthy();
    expect(result.hooks).toHaveLength(3);
    expect(result.hashtags).toHaveLength(10);
    expect(result.metadata.topic).toBe('mysterious forest');
  });

  it('should generate TTS audio', async () => {
    const result = await services.tts.generateVoiceOver('Test script content', {
      voice: 'en_US-amy-medium',
      speed: 1.0
    });

    expect(result.path).toBeTruthy();
    expect(result.duration).toBeGreaterThan(0);
    expect(result.voice).toBe('en_US-amy-medium');
  });

  it('should process video background', async () => {
    const mockVideoPath = './tests/fixtures/sample.mp4';
    
    const result = await services.video.processBackground(mockVideoPath, {
      duration: 60,
      platform: 'tiktok'
    });

    expect(result.path).toBeTruthy();
    expect(result.duration).toBe(60);
    expect(result.platform).toBe('tiktok');
  });

  it('should generate subtitles', async () => {
    const mockAudioPath = './tests/fixtures/sample.wav';
    
    const result = await services.subtitle.generateSubtitles(mockAudioPath, {
      language: 'en',
      format: 'srt'
    });

    expect(result.path).toBeTruthy();
    expect(result.language).toBe('en');
    expect(result.format).toBe('srt');
    expect(result.segments).toBeInstanceOf(Array);
  });

  it('should handle batch processing', async () => {
    const jobs = [
      { topic: 'test 1', genre: 'horror' },
      { topic: 'test 2', genre: 'mystery' }
    ];

    const batch = await services.batch.addBatch(jobs);

    expect(batch.id).toBeTruthy();
    expect(batch.totalJobs).toBe(2);
    expect(batch.status).toBe('queued');
  });
});