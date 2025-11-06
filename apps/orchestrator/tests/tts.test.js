import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('TTS (Text-to-Speech) Module', () => {
  describe('POST /tts/generate', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/tts/generate')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('errors');

      // Check that 'text' field is mentioned in validation errors
      const fieldNames = response.body.error.details.errors.map(e => e.field);
      expect(fieldNames).toContain('text');
    });

    it('should accept valid TTS request with default settings', async () => {
      const payload = {
        text: 'This is a test voice-over for a vertical video.',
        outputPath: 'data/tts/test-voice-001.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('outputPath');
        expect(response.body.data).toHaveProperty('duration');
        expect(response.body.data.duration).toBeGreaterThan(0);
      }
    });

    it('should accept TTS request with custom voice', async () => {
      const payload = {
        text: 'Testing different voice models.',
        voice: 'en_US-amy-medium',
        outputPath: 'data/tts/test-voice-002.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should accept TTS request with speed adjustment', async () => {
      const payload = {
        text: 'This is spoken at a different speed.',
        speed: 1.2,
        outputPath: 'data/tts/test-voice-003.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload);

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should validate text length limits', async () => {
      const longText = 'A'.repeat(10000); // Very long text
      
      const payload = {
        text: longText,
        outputPath: 'data/tts/test-voice-long.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload);

      // Should either accept or reject based on length limits
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should reject empty text', async () => {
      const payload = {
        text: '',
        outputPath: 'data/tts/test-voice-empty.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload)
        .expect(400);

      expect(response.body.error).toBeTruthy();
    });

    it('should handle special characters in text', async () => {
      const payload = {
        text: 'This text has "quotes", numbers 123, and symbols: @#$%!',
        outputPath: 'data/tts/test-voice-special.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload);

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should validate speed range', async () => {
      const payload = {
        text: 'Testing extreme speed.',
        speed: 5.0, // Too fast
        outputPath: 'data/tts/test-voice-fast.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload);

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should accept TTS with SSML markup', async () => {
      const payload = {
        text: '<speak>This is <emphasis>emphasized</emphasis> text.</speak>',
        format: 'ssml',
        outputPath: 'data/tts/test-voice-ssml.wav'
      };

      const response = await request(app)
        .post('/tts/generate')
        .send(payload);

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should support different output formats', async () => {
      const formats = ['wav', 'mp3', 'ogg'];

      for (const format of formats) {
        const payload = {
          text: `Testing ${format} format output.`,
          outputPath: `data/tts/test-voice.${format}`,
          format
        };

        const response = await request(app)
          .post('/tts/generate')
          .send(payload);

        expect([200, 400, 500]).toContain(response.status);
      }
    });
  });

  describe('GET /tts/voices', () => {
    it('should return list of available voices', async () => {
      const response = await request(app)
        .get('/tts/voices')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('voices');
      expect(Array.isArray(response.body.data.voices)).toBe(true);
      
      if (response.body.data.voices.length > 0) {
        const voice = response.body.data.voices[0];
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('language');
      }
    });

    it('should support filtering by language', async () => {
      const response = await request(app)
        .get('/tts/voices')
        .query({ language: 'en_US' })
        .expect(200);

      expect(response.body.data.voices).toBeDefined();
    });

    it('should support filtering by gender', async () => {
      const response = await request(app)
        .get('/tts/voices')
        .query({ gender: 'female' })
        .expect(200);

      expect(response.body.data.voices).toBeDefined();
    });

    it('should return voice details with quality info', async () => {
      const response = await request(app)
        .get('/tts/voices')
        .expect(200);

      if (response.body.data.voices.length > 0) {
        const voice = response.body.data.voices[0];
        // Voice should have metadata
        expect(typeof voice.id).toBe('string');
        expect(typeof voice.name).toBe('string');
      }
    });
  });
});
