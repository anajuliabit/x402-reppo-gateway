import request from 'supertest';
import express from 'express';
import { healthRouter } from '../../src/routes/health.js';

describe('Health Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use('/health', healthRouter);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.network).toBe('eip155:84532');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.ready).toBe(true);
      expect(response.body.services).toBeDefined();
      expect(response.body.services.reppo).toBe('mock');
    });
  });
});
