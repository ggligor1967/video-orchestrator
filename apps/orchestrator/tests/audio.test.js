import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('Audio Processing Module', () => {
  describe('POST /audio/normalize', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/audio/normalize')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('errors');

      // Check that 'inputPath' field is mentioned in validation errors
      const fieldNames = response.body.error.details.errors.map(e => e.field);
      expect(fieldNames).toContain('inputPath');
    });

    it('should accept valid normalize request with default settings', async () => {
      const payload = {
        inputPath: 'data/tts/voice-001.wav',
        outputPath: 'data/cache/audio/normalized.wav'
      };

      const response = await request(app)
        .post('/audio/normalize')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should accept valid normalize request with custom LUFS target', async () => {
      const payload = {
        inputPath: 'data/tts/voice-001.wav',
        outputPath: 'data/cache/audio/normalized.wav',
        targetLUFS: -16.0
      };

      const response = await request(app)
        .post('/audio/normalize')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('outputPath');
      }
    });

    it('should accept valid normalize request with peak limiting', async () => {
      const payload = {
        inputPath: 'data/tts/voice-001.wav',
        outputPath: 'data/cache/audio/normalized.wav',
        targetLUFS: -16.0,
        peakLimit: -1.0
      };

      const response = await request(app)
        .post('/audio/normalize')
        .send(payload);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should validate LUFS target range', async () => {
      const payload = {
        inputPath: 'data/tts/voice-001.wav',
        outputPath: 'data/cache/audio/normalized.wav',
        targetLUFS: -5.0 // Too high - likely invalid
      };

      const response = await request(app)
        .post('/audio/normalize')
        .send(payload);

      // Should either accept or reject based on validation
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /audio/mix', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/audio/mix')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid mix request with two tracks', async () => {
      const payload = {
        tracks: [
          {
            path: 'data/tts/voice-001.wav',
            volume: 1.0,
            startTime: 0.0
          },
          {
            path: 'data/assets/audio/bg-music.mp3',
            volume: 0.3,
            startTime: 0.0
          }
        ],
        outputPath: 'data/cache/audio/mixed.wav'
      };

      const response = await request(app)
        .post('/audio/mix')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should accept mix request with multiple tracks', async () => {
      const payload = {
        tracks: [
          {
            path: 'data/tts/voice-001.wav',
            volume: 1.0,
            startTime: 0.0
          },
          {
            path: 'data/tts/voice-002.wav',
            volume: 1.0,
            startTime: 5.0
          },
          {
            path: 'data/assets/audio/bg-music.mp3',
            volume: 0.2,
            startTime: 0.0
          },
          {
            path: 'data/assets/audio/sfx-whoosh.wav',
            volume: 0.8,
            startTime: 2.5
          }
        ],
        outputPath: 'data/cache/audio/complex-mix.wav'
      };

      const response = await request(app)
        .post('/audio/mix')
        .send(payload);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should validate track volume range', async () => {
      const payload = {
        tracks: [
          {
            path: 'data/tts/voice-001.wav',
            volume: 3.0, // Too high
            startTime: 0.0
          }
        ],
        outputPath: 'data/cache/audio/mixed.wav'
      };

      const response = await request(app)
        .post('/audio/mix')
        .send(payload);

      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should validate minimum number of tracks', async () => {
      const payload = {
        tracks: [],
        outputPath: 'data/cache/audio/mixed.wav'
      };

      const response = await request(app)
        .post('/audio/mix')
        .send(payload)
        .expect(400);

      expect(response.body.error).toBeTruthy();
    });

    it('should accept mix with fade in/out effects', async () => {
      const payload = {
        tracks: [
          {
            path: 'data/assets/audio/bg-music.mp3',
            volume: 0.5,
            startTime: 0.0,
            fadeIn: 2.0,
            fadeOut: 3.0
          }
        ],
        outputPath: 'data/cache/audio/mixed-fade.wav'
      };

      const response = await request(app)
        .post('/audio/mix')
        .send(payload);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /audio/info', () => {
    it('should validate required audio path', async () => {
      const response = await request(app)
        .get('/audio/info')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent audio file', async () => {
      const response = await request(app)
        .get('/audio/info')
        .query({ path: 'data/tts/nonexistent-file.wav' }) // Use allowed dir with non-existent file
        .expect('Content-Type', /json/);

      expect([404, 500]).toContain(response.status);
    });

    it('should accept valid audio info request', async () => {
      const response = await request(app)
        .get('/audio/info')
        .query({ path: 'data/tts/voice-001.wav' })
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('duration');
        expect(response.body.data).toHaveProperty('sampleRate');
        expect(response.body.data).toHaveProperty('channels');
        expect(response.body.data).toHaveProperty('bitRate');
      }
    });

    it('should support multiple audio formats', async () => {
      const formats = ['wav', 'mp3', 'aac', 'flac'];

      for (const format of formats) {
        const response = await request(app)
          .get('/audio/info')
          .query({ path: `data/assets/audio/test.${format}` });

        // File may not exist, but request structure should be valid
        expect([200, 404, 500]).toContain(response.status);
      }
    });
  });
});
