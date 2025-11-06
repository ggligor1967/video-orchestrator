import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('AI Script Generation', () => {
  describe('POST /ai/script', () => {
    it('should generate script with valid input', async () => {
      const payload = {
        topic: 'haunted mansion mystery',
        genre: 'horror',
        duration: 60
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('script');
      expect(response.body.data).toHaveProperty('hooks');
      expect(response.body.data).toHaveProperty('hashtags');
      
      expect(typeof response.body.data.script).toBe('string');
      expect(response.body.data.script.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data.hooks)).toBe(true);
      expect(Array.isArray(response.body.data.hashtags)).toBe(true);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/ai/script')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('errors');

      // Check that 'topic' field is mentioned in validation errors
      const fieldNames = response.body.error.details.errors.map(e => e.field);
      expect(fieldNames).toContain('topic');
    });

    it('should validate genre enum', async () => {
      const payload = {
        topic: 'some story',
        genre: 'invalid-genre'
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept all valid genres', async () => {
      const genres = ['horror', 'mystery', 'paranormal', 'true crime'];
      
      for (const genre of genres) {
        const payload = {
          topic: 'test story',
          genre: genre
        };

        const response = await request(app)
          .post('/ai/script')
          .send(payload)
          .expect(200);

        expect(response.body.data).toHaveProperty('script');
      }
    }, 10000); // Longer timeout for multiple requests

    it('should handle duration parameter', async () => {
      const payload = {
        topic: 'ghost story',
        genre: 'horror',
        duration: 90
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect(200);

      expect(response.body.data).toHaveProperty('script');
    });

    it('should return hooks array with at least one hook', async () => {
      const payload = {
        topic: 'mysterious disappearance',
        genre: 'mystery'
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect(200);

      expect(response.body.data.hooks.length).toBeGreaterThan(0);
      expect(typeof response.body.data.hooks[0]).toBe('string');
    });

    it('should return hashtags array with at least one hashtag', async () => {
      const payload = {
        topic: 'paranormal investigation',
        genre: 'paranormal'
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect(200);

      expect(response.body.data.hashtags.length).toBeGreaterThan(0);
      expect(typeof response.body.data.hashtags[0]).toBe('string');
      expect(response.body.data.hashtags[0]).toMatch(/^#/);
    });

    it('should handle special characters in topic', async () => {
      const payload = {
        topic: 'The Haunted House on "Elm Street" & other stories',
        genre: 'horror'
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect(200);

      expect(response.body.data).toHaveProperty('script');
    });

    it('should reject extremely long topics', async () => {
      const payload = {
        topic: 'a'.repeat(1000),
        genre: 'horror'
      };

      const response = await request(app)
        .post('/ai/script')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('AI Service Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    // This test ensures the mock fallback works when API keys are missing
    const payload = {
      topic: 'test story',
      genre: 'horror'
    };

    const response = await request(app)
      .post('/ai/script')
      .send(payload)
      .expect(200);

    // Should still return a valid response even without API keys (mock)
    expect(response.body.data).toHaveProperty('script');
  });
});
