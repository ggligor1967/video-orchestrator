import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

describe('Rate Limiting', () => {
  let app;

  beforeAll(() => {
    app = express();
    
    // Create a rate limiter for testing (low limits for fast tests)
    const testLimiter = rateLimit({
      windowMs: 1000, // 1 second window
      max: 3, // 3 requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: { 
        success: false,
        error: 'Too many requests',
        retryAfter: '1 second'
      }
    });

    app.use('/api', testLimiter);
    
    app.get('/api/test', (req, res) => {
      res.json({ success: true });
    });
  });

  it('should allow requests under the limit', async () => {
    const res1 = await request(app).get('/api/test');
    expect(res1.status).toBe(200);
    
    const res2 = await request(app).get('/api/test');
    expect(res2.status).toBe(200);
    
    const res3 = await request(app).get('/api/test');
    expect(res3.status).toBe(200);
  });

  it('should block requests over the limit', async () => {
    // Make requests up to the limit
    await request(app).get('/api/test');
    await request(app).get('/api/test');
    await request(app).get('/api/test');
    
    // This one should be blocked
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(429);
    expect(res.body.error).toBeDefined();
  });

  it('should include rate limit headers', async () => {
    const res = await request(app).get('/api/test');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('should reset after window expires', async () => {
    // Make requests up to limit
    await request(app).get('/api/test');
    await request(app).get('/api/test');
    await request(app).get('/api/test');
    
    // Should be blocked
    let res = await request(app).get('/api/test');
    expect(res.status).toBe(429);
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Should work again
    res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
  });
});

describe('Rate Limiting - AI Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    
    // Stricter limit for AI endpoints
    const aiLimiter = rateLimit({
      windowMs: 2000, // 2 second window
      max: 2, // 2 requests per window
      message: { 
        success: false,
        error: 'AI rate limit exceeded',
        retryAfter: '2 seconds'
      }
    });

    app.use('/ai', aiLimiter);
    
    app.post('/ai/script', (req, res) => {
      res.json({ script: 'test' });
    });
  });

  it('should have stricter limits for AI endpoints', async () => {
    // First two requests should work
    const res1 = await request(app).post('/ai/script');
    expect(res1.status).toBe(200);
    
    const res2 = await request(app).post('/ai/script');
    expect(res2.status).toBe(200);
    
    // Third should be blocked
    const res3 = await request(app).post('/ai/script');
    expect(res3.status).toBe(429);
    expect(res3.body.error).toContain('AI rate limit');
  });
});
