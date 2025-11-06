import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isServiceAvailable,
  markServiceAvailable,
  markServiceUnavailable,
  getServiceStatus,
  withGracefulDegradation,
  ttsFallback,
  whisperFallback,
  aiServiceFallback,
  ServiceFlags,
  setTimeProvider,
  resetTimeProvider
} from '../../src/utils/gracefulDegradation.js';

describe('Service Availability Tracking', () => {
  beforeEach(() => {
    // Reset all service statuses
    markServiceAvailable(ServiceFlags.AI);
    markServiceAvailable(ServiceFlags.TTS);
    markServiceAvailable(ServiceFlags.WHISPER);
  });

  afterEach(() => {
    // Reset time provider after each test
    resetTimeProvider();
  });

  it('should mark service as unavailable', () => {
    markServiceUnavailable(ServiceFlags.AI, 1000);
    expect(isServiceAvailable(ServiceFlags.AI)).toBe(false);
  });

  it('should mark service as available', () => {
    markServiceUnavailable(ServiceFlags.AI, 1000);
    markServiceAvailable(ServiceFlags.AI);
    expect(isServiceAvailable(ServiceFlags.AI)).toBe(true);
  });

  it('should allow retry after cooldown period', async () => {
    let currentTime = 1000000;
    setTimeProvider(() => currentTime);
    
    markServiceUnavailable(ServiceFlags.TTS, 1000);
    expect(isServiceAvailable(ServiceFlags.TTS)).toBe(false);
    
    // Advance time past cooldown
    currentTime += 1001;
    expect(isServiceAvailable(ServiceFlags.TTS)).toBe(true);
  });

  it('should return status of all services', () => {
    markServiceAvailable(ServiceFlags.AI);
    markServiceUnavailable(ServiceFlags.TTS, 5000);
    
    const status = getServiceStatus();
    
    expect(status[ServiceFlags.AI].available).toBe(true);
    expect(status[ServiceFlags.TTS].available).toBe(false);
    expect(status[ServiceFlags.TTS]).toHaveProperty('canRetry');
  });
});

describe('withGracefulDegradation', () => {
  beforeEach(() => {
    markServiceAvailable(ServiceFlags.AI);
  });

  it('should execute operation successfully when service available', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    const fallback = vi.fn().mockResolvedValue('fallback');

    const result = await withGracefulDegradation(
      ServiceFlags.AI,
      operation,
      fallback
    );

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('should use fallback when operation fails', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Service error'));
    const fallback = vi.fn().mockResolvedValue('fallback');

    const result = await withGracefulDegradation(
      ServiceFlags.AI,
      operation,
      fallback,
      { required: false }
    );

    expect(result).toBe('fallback');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('should throw error when required service fails', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Service error'));
    const fallback = vi.fn().mockResolvedValue('fallback');

    await expect(
      withGracefulDegradation(
        ServiceFlags.AI,
        operation,
        fallback,
        { required: true }
      )
    ).rejects.toThrow('Service error');

    expect(fallback).not.toHaveBeenCalled();
  });

  it('should skip operation if service is known to be unavailable', async () => {
    markServiceUnavailable(ServiceFlags.AI, 5000);
    
    const operation = vi.fn().mockResolvedValue('success');
    const fallback = vi.fn().mockResolvedValue('fallback');

    const result = await withGracefulDegradation(
      ServiceFlags.AI,
      operation,
      fallback,
      { required: false }
    );

    expect(result).toBe('fallback');
    expect(operation).not.toHaveBeenCalled();
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('should mark service unavailable after failure', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Service error'));
    const fallback = vi.fn().mockResolvedValue('fallback');

    await withGracefulDegradation(
      ServiceFlags.TTS,
      operation,
      fallback,
      { required: false }
    );

    expect(isServiceAvailable(ServiceFlags.TTS)).toBe(false);
  });

  it('should use custom cooldown period', async () => {
    let currentTime = 2000000;
    setTimeProvider(() => currentTime);
    
    const operation = vi.fn().mockRejectedValue(new Error('Service error'));
    const fallback = vi.fn().mockResolvedValue('fallback');

    await withGracefulDegradation(
      ServiceFlags.WHISPER,
      operation,
      fallback,
      { required: false, cooldownMs: 2000 }
    );

    expect(isServiceAvailable(ServiceFlags.WHISPER)).toBe(false);
    
    // Advance time past the cooldown period (2000ms)
    currentTime += 2001;
    expect(isServiceAvailable(ServiceFlags.WHISPER)).toBe(true);
  });

  it('should return null when fallback not provided', async () => {
    markServiceUnavailable(ServiceFlags.AI, 5000);

    const operation = vi.fn().mockResolvedValue('success');

    const result = await withGracefulDegradation(
      ServiceFlags.AI,
      operation,
      null, // No fallback
      { required: false }
    );

    expect(result).toBeNull();
  });
});

describe('Fallback Functions', () => {
  it('ttsFallback should return fallback response', async () => {
    const result = await ttsFallback(60);

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('fallback', true);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('audioPath', null);
    expect(result).toHaveProperty('duration', 60);
  });

  it('whisperFallback should return empty subtitle template', async () => {
    const result = await whisperFallback();

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('fallback', true);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('subtitlePath', null);
    expect(result).toHaveProperty('segments');
    expect(result.segments).toEqual([]);
  });

  it('aiServiceFallback should return template script', async () => {
    const result = await aiServiceFallback('haunted house', 'horror');

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('fallback', true);
    expect(result).toHaveProperty('script');
    expect(result).toHaveProperty('hooks');
    expect(result).toHaveProperty('hashtags');
    expect(result).toHaveProperty('metadata');
    
    expect(result.script).toContain('haunted house');
    expect(result.script).toContain('horror');
    expect(result.metadata).toHaveProperty('fallback', true);
  });

  it('aiServiceFallback should include topic and genre in response', async () => {
    const topic = 'cursed artifact';
    const genre = 'paranormal';
    
    const result = await aiServiceFallback(topic, genre);

    expect(result.script).toContain(topic);
    expect(result.script).toContain(genre);
    expect(result.metadata.topic).toBe(topic);
    expect(result.metadata.genre).toBe(genre);
    expect(result.hooks.length).toBeGreaterThan(0);
    expect(result.hashtags.length).toBeGreaterThan(0);
  });
});

describe('ServiceFlags', () => {
  it('should export service flag constants', () => {
    expect(ServiceFlags).toHaveProperty('TTS');
    expect(ServiceFlags).toHaveProperty('WHISPER');
    expect(ServiceFlags).toHaveProperty('AI');
    expect(ServiceFlags).toHaveProperty('FFMPEG');
    expect(ServiceFlags).toHaveProperty('STOCK_MEDIA');
  });

  it('should have unique values for each service', () => {
    const values = Object.values(ServiceFlags);
    const uniqueValues = new Set(values);
    
    expect(values.length).toBe(uniqueValues.size);
  });
});
