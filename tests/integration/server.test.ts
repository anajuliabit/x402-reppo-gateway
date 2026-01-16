import request from 'supertest';
import { createServer } from '../../src/server.js';
import type { Application } from 'express';

describe('Server Integration', () => {
  let app: Application;

  beforeAll(() => {
    app = createServer();
  });

  describe('Health endpoints (no payment required)', () => {
    it('GET /health should be accessible without payment', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('GET /health/ready should be accessible without payment', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.ready).toBe(true);
    });
  });

  describe('Protected endpoints (payment required)', () => {
    it('GET /api/rag/query should return 402 without payment', async () => {
      const response = await request(app)
        .get('/api/rag/query')
        .query({ q: 'Test query' });

      expect(response.status).toBe(402);
    });

    it('402 response should include PAYMENT-REQUIRED header', async () => {
      const response = await request(app)
        .get('/api/rag/query')
        .query({ q: 'Test query' });

      expect(response.status).toBe(402);
      expect(response.headers['payment-required']).toBeDefined();
    });

    it('should decode payment requirements from header', async () => {
      const response = await request(app)
        .get('/api/rag/query')
        .query({ q: 'Test query' });

      const paymentHeader = response.headers['payment-required'];
      const decoded = JSON.parse(
        Buffer.from(paymentHeader, 'base64').toString('utf-8')
      );

      expect(decoded.x402Version).toBe(2);
      expect(decoded.accepts).toBeInstanceOf(Array);
      expect(decoded.accepts[0].scheme).toBe('exact');
      expect(decoded.accepts[0].network).toBe('eip155:84532');
      expect(decoded.resource).toBeDefined();
      expect(decoded.resource.description).toContain('RAG');
    });
  });

  describe('Security headers', () => {
    it('should include helmet security headers', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://example.com');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('404 handling', () => {
    it('should handle unknown routes gracefully', async () => {
      const response = await request(app).get('/unknown-route');

      // Express returns 404 by default for unknown routes
      expect(response.status).toBe(404);
    });
  });
});
