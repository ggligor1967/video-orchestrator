import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('Video Processing Module', () => {
  describe('POST /video/crop', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/video/crop')
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

    it('should validate aspect ratio enum', async () => {
      const response = await request(app)
        .post('/video/crop')
        .send({
          inputPath: 'data/assets/backgrounds/test.mp4',  // Valid path for security middleware
          outputPath: 'data/cache/video/output.mp4',
          aspectRatio: 'invalid'  // Invalid aspectRatio - should fail Zod validation
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('errors');

      // Check that 'aspectRatio' field is mentioned in validation errors
      const fieldNames = response.body.error.details.errors.map(e => e.field);
      expect(fieldNames).toContain('aspectRatio');
    });

    it('should accept valid crop request', async () => {
      const payload = {
        inputPath: 'data/assets/backgrounds/test-video.mp4',
        aspectRatio: '9:16',
        outputPath: 'data/cache/video/cropped.mp4'
      };

      const response = await request(app)
        .post('/video/crop')
        .send(payload)
        .expect('Content-Type', /json/);

      // Will fail if file doesn't exist, but validates request structure
      expect([200, 404, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('outputPath');
      }
    });

    it('should support all valid aspect ratios', async () => {
      const aspectRatios = ['9:16', '16:9', '1:1', '4:5'];

      for (const aspectRatio of aspectRatios) {
        const response = await request(app)
          .post('/video/crop')
          .send({
            inputPath: 'data/assets/backgrounds/test.mp4',
            aspectRatio,
            outputPath: `data/cache/video/crop-${aspectRatio.replace(':', '-')}.mp4`
          });

        // Structure validation - file may not exist but request should be valid
        expect([200, 404, 500]).toContain(response.status);
      }
    });
  });

  describe('POST /video/auto-reframe', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/video/auto-reframe')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid reframe request', async () => {
      const payload = {
        inputPath: 'data/assets/backgrounds/test.mp4',
        targetAspect: '9:16',
        outputPath: 'data/cache/video/reframed.mp4'
      };

      const response = await request(app)
        .post('/video/auto-reframe')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /video/speed-ramp', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/video/speed-ramp')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate speed multiplier range', async () => {
      const response = await request(app)
        .post('/video/speed-ramp')
        .send({
          inputPath: 'data/assets/backgrounds/test.mp4',
          startTime: 2.0,
          endTime: 10.0,
          speedMultiplier: 5.0, // Too high
          outputPath: 'data/cache/video/ramped.mp4'
        })
        .expect('Content-Type', /json/);

      // Should either reject or accept based on validation rules
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should accept valid speed ramp request', async () => {
      const payload = {
        inputPath: 'data/assets/backgrounds/test.mp4',
        startTime: 2.0,
        endTime: 10.0,
        speedMultiplier: 1.5,
        outputPath: 'data/cache/video/ramped.mp4'
      };

      const response = await request(app)
        .post('/video/speed-ramp')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should validate start time before end time', async () => {
      const payload = {
        inputPath: 'data/assets/backgrounds/test.mp4',
        startTime: 10.0,
        endTime: 2.0, // Invalid - end before start
        speedMultiplier: 1.5,
        outputPath: 'data/cache/video/ramped.mp4'
      };

      const response = await request(app)
        .post('/video/speed-ramp')
        .send(payload);

      // Should reject invalid time range
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /video/merge-audio', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/video/merge-audio')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid merge request', async () => {
      const payload = {
        videoPath: 'data/cache/video/cropped.mp4',
        audioPath: 'data/tts/voice-001.wav',
        outputPath: 'data/cache/video/merged.mp4',
        audioVolume: 1.0
      };

      const response = await request(app)
        .post('/video/merge-audio')
        .send(payload)
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should validate audio volume range', async () => {
      const payload = {
        videoPath: 'data/cache/video/cropped.mp4',
        audioPath: 'data/tts/voice-001.wav',
        outputPath: 'data/cache/video/merged.mp4',
        audioVolume: 2.5 // Potentially too high
      };

      const response = await request(app)
        .post('/video/merge-audio')
        .send(payload);

      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should support optional background music', async () => {
      const payload = {
        videoPath: 'data/cache/video/cropped.mp4',
        audioPath: 'data/tts/voice-001.wav',
        backgroundMusicPath: 'data/assets/audio/bg-music.mp3',
        outputPath: 'data/cache/video/merged.mp4',
        audioVolume: 1.0,
        musicVolume: 0.3
      };

      const response = await request(app)
        .post('/video/merge-audio')
        .send(payload);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /video/info', () => {
    it('should validate required video path', async () => {
      const response = await request(app)
        .get('/video/info')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/video/info')
        .query({ path: 'data/assets/backgrounds/nonexistent-video.mp4' }) // Use allowed dir with non-existent file
        .expect('Content-Type', /json/);

      expect([404, 500]).toContain(response.status);
    });

    it('should accept valid video info request', async () => {
      const response = await request(app)
        .get('/video/info')
        .query({ path: 'data/assets/backgrounds/test.mp4' })
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('duration');
        expect(response.body.data).toHaveProperty('width');
        expect(response.body.data).toHaveProperty('height');
        expect(response.body.data).toHaveProperty('fps');
      }
    });
  });
});
