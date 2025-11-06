import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('Health Endpoint', () => {
  describe('GET /health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      // In test environment, tools may not be available, so 'degraded' is acceptable
      expect(['ok', 'degraded']).toContain(response.body.status);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('api');
      expect(response.body.api).toHaveProperty('version');
    });

    it('should return consistent timestamp format', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return uptime as a number', async () => {
      const response = await request(app).get('/health');
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include tools status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body).toHaveProperty('tools');
      expect(response.body.tools).toHaveProperty('ffmpeg');
      expect(response.body.tools).toHaveProperty('piper');
      expect(response.body.tools).toHaveProperty('whisper');
    });
  });
});

describe('Root Endpoint', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('Video Orchestrator API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('running');
    });

    it('should include endpoints documentation', async () => {
      const response = await request(app).get('/');
      
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('ai');
      expect(response.body.endpoints).toHaveProperty('assets');
    });
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/nonexistent-endpoint')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('error');
    // New error format: error is an object with code and message
    expect(response.body.error).toMatchObject({
      code: 'ENDPOINT_NOT_FOUND',
      message: 'Endpoint not found'
    });
  });

  it('should return 404 for unknown API routes', async () => {
    const response = await request(app)
      .get('/api/does-not-exist')
      .expect(404);

    // New error format: error is an object with code and message
    expect(response.body.error).toMatchObject({
      code: 'ENDPOINT_NOT_FOUND',
      message: 'Endpoint not found'
    });
  });
});

describe('CORS Configuration', () => {
  it('should include CORS headers for allowed origins', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://127.0.0.1:1421')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should handle OPTIONS preflight requests', async () => {
    const response = await request(app)
      .options('/health')
      .set('Origin', 'http://127.0.0.1:1421')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-methods']).toBeDefined();
  });
});
