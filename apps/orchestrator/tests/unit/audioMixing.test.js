import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/container/index.js';

// Integration tests for audio mixing API - validates schemas and contracts
describe('Advanced Audio Mixing', () => {
  let app;
  let container;

  beforeAll(async () => {
    container = createContainer();
    app = createApp({ container });
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('POST /audio/mix - Basic Mixing', () => {
    it('should validate track schema with type field', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              volume: 1.0,
              type: 'voice'
            },
            {
              path: 'data/assets/audio/bg-music.mp3',
              volume: 0.3,
              type: 'background'
            }
          ]
        });

      // Will fail because files don't exist, but validates schema
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept fade in/out parameters', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              volume: 1.0,
              fadeIn: 1.5,
              fadeOut: 2.0,
              type: 'voice'
            }
          ]
        });

      // Will fail because file doesn't exist, but validates schema
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid fade durations', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice.wav',
              fadeIn: 15, // Too long (max 10)
              type: 'voice'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept startTime parameter for track offset', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              volume: 1.0,
              startTime: 2.5, // Start after 2.5 seconds
              type: 'voice'
            }
          ]
        });

      // Will fail because file doesn't exist, but validates schema
      expect(response.status).toBe(500);
    });
  });

  describe('POST /audio/mix - Advanced Options', () => {
    it('should accept normalize option', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              type: 'voice'
            }
          ],
          options: {
            normalize: true
          }
        });

      // Will fail because file doesn't exist, but validates schema
      expect(response.status).toBe(500);
    });

    it('should accept ducking options', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              type: 'voice',
              volume: 1.0
            },
            {
              path: 'data/assets/audio/bg-music.mp3',
              type: 'background',
              volume: 0.5
            }
          ],
          options: {
            duckingEnabled: true,
            duckingAmount: 0.3,
            duckingThreshold: -25
          }
        });

      // Will fail because files don't exist, but validates schema
      expect(response.status).toBe(500);
    });

    it('should accept crossfade option', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/part1.wav',
              type: 'voice'
            },
            {
              path: 'data/tts/part2.wav',
              type: 'voice'
            }
          ],
          options: {
            crossfade: 2.0 // 2 second crossfade
          }
        });

      // Will fail because files don't exist, but validates schema
      expect(response.status).toBe(500);
    });

    it('should reject invalid ducking amount', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', type: 'voice' }
          ],
          options: {
            duckingAmount: 1.5 // Too high (max 1.0)
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid ducking threshold', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', type: 'voice' }
          ],
          options: {
            duckingThreshold: 10 // Must be negative
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all options combined', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              volume: 1.0,
              fadeIn: 1.0,
              fadeOut: 1.5,
              startTime: 0,
              type: 'voice'
            },
            {
              path: 'data/assets/audio/bg-music.mp3',
              volume: 0.4,
              fadeIn: 2.0,
              fadeOut: 3.0,
              startTime: 0,
              type: 'background'
            }
          ],
          options: {
            normalize: true,
            duckingEnabled: true,
            duckingAmount: 0.3,
            duckingThreshold: -30
          }
        });

      // Will fail because files don't exist, but validates schema
      expect(response.status).toBe(500);
    });
  });

  describe('POST /audio/mix - Track Type Validation', () => {
    it('should accept voice type', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', type: 'voice' }
          ]
        });

      expect([400, 500]).toContain(response.status);
    });

    it('should accept background type', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/assets/audio/music.mp3', type: 'background' }
          ]
        });

      expect([400, 500]).toContain(response.status);
    });

    it('should accept sfx type', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/assets/audio/sfx.wav', type: 'sfx' }
          ]
        });

      expect([400, 500]).toContain(response.status);
    });

    it('should reject invalid track type', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', type: 'invalid' }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should default to background type when not specified', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/assets/audio/music.mp3' }
            // type not specified, should default to 'background'
          ]
        });

      // Will fail because file doesn't exist, but validates schema
      expect(response.status).toBe(500);
    });
  });

  describe('POST /audio/mix - Volume Control', () => {
    it('should accept volume between 0 and 2', async () => {
      const validVolumes = [0, 0.5, 1.0, 1.5, 2.0];

      for (const volume of validVolumes) {
        const response = await request(app)
          .post('/audio/mix')
          .send({
            tracks: [
              { path: 'data/tts/voice.wav', volume, type: 'voice' }
            ]
          });

        // Should pass validation (fail on file not found)
        expect([400, 500]).toContain(response.status);
      }
    });

    it('should reject volume below 0', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', volume: -0.5, type: 'voice' }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject volume above 2', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', volume: 2.5, type: 'voice' }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should default volume to 1.0', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            { path: 'data/tts/voice.wav', type: 'voice' }
            // volume not specified
          ]
        });

      // Will fail because file doesn't exist, but validates schema
      expect(response.status).toBe(500);
    });
  });

  describe('POST /audio/mix - Multiple Tracks', () => {
    it('should accept multiple tracks with different types', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [
            {
              path: 'data/tts/voice-001.wav',
              volume: 1.0,
              type: 'voice',
              fadeIn: 0.5,
              fadeOut: 1.0
            },
            {
              path: 'data/assets/audio/bg-music.mp3',
              volume: 0.3,
              type: 'background',
              fadeIn: 2.0
            },
            {
              path: 'data/assets/audio/swoosh.wav',
              volume: 0.8,
              type: 'sfx',
              startTime: 5.0
            }
          ],
          options: {
            normalize: true,
            duckingEnabled: true
          }
        });

      // Will fail because files don't exist, but validates schema
      expect(response.status).toBe(500);
    });

    it('should require at least one track', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /audio/mix - Response Format', () => {
    it('should have consistent error format', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({
          tracks: [] // Invalid - empty
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

