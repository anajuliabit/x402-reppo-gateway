import request from 'supertest';
import { createTestApp } from './helpers.js';
import type { Application } from 'express';

describe('RAG API Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/rag/services', () => {
    it('should return service catalog', async () => {
      const response = await request(app).get('/api/rag/services');

      expect(response.status).toBe(200);
      expect(response.body.services).toBeInstanceOf(Array);
      expect(response.body.services.length).toBeGreaterThan(0);

      const service = response.body.services[0];
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('description');
      expect(service).toHaveProperty('pricePerQuery');
    });

    it('should include expected services', async () => {
      const response = await request(app).get('/api/rag/services');

      expect(response.status).toBe(200);

      const serviceIds = response.body.services.map(
        (s: { id: string }) => s.id
      );
      expect(serviceIds).toContain('general');
      expect(serviceIds).toContain('scientific');
      expect(serviceIds).toContain('code');
      expect(serviceIds).toContain('financial');
    });
  });

  describe('GET /api/rag/query', () => {
    describe('successful queries', () => {
      it('should return results for valid query with service', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'What is machine learning?', service: 'general' });

        expect(response.status).toBe(200);
        expect(response.body.query).toBe('What is machine learning?');
        expect(response.body.service).toBe('general');
        expect(response.body.results).toBeInstanceOf(Array);
        expect(response.body.results.length).toBeGreaterThan(0);
        expect(response.body.provenance).toBeDefined();
        expect(response.body.provenance.subnets).toBeInstanceOf(Array);
        expect(response.body.qualityScore).toBeDefined();
        expect(response.body.processingTimeMs).toBeGreaterThan(0);
        expect(response.body.pricing).toBeDefined();
      });

      it('should use scientific service when provided', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test query', service: 'scientific' });

        expect(response.status).toBe(200);
        expect(response.body.service).toBe('scientific');
        expect(response.body.pricing.service).toBe('scientific');
        expect(response.body.pricing.price).toBe('$0.02');
      });

      it('should respect maxResults parameter', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test query', service: 'general', maxResults: 2 });

        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(2);
      });

      it('should return results with correct structure', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'general', maxResults: 1 });

        expect(response.status).toBe(200);

        const result = response.body.results[0];
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('relevanceScore');
        expect(result).toHaveProperty('source');
        expect(result.source).toHaveProperty('subnet');
        expect(result.source).toHaveProperty('document');
        expect(result.source).toHaveProperty('uri');
        expect(typeof result.text).toBe('string');
        expect(typeof result.relevanceScore).toBe('number');
      });

      it('should return enhanced provenance with subnet details', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'general', maxResults: 3 });

        expect(response.status).toBe(200);

        const provenance = response.body.provenance;
        expect(provenance).toHaveProperty('subnets');
        expect(provenance).toHaveProperty('totalSources');
        expect(provenance).toHaveProperty('responseTimeBySubnet');
        expect(provenance.subnets).toBeInstanceOf(Array);
        expect(provenance.subnets.length).toBeGreaterThan(0);
        expect(typeof provenance.totalSources).toBe('number');
      });

      it('should return quality score between 0 and 1', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'general' });

        expect(response.status).toBe(200);
        expect(response.body.qualityScore).toBeGreaterThanOrEqual(0);
        expect(response.body.qualityScore).toBeLessThanOrEqual(1);
      });

      it('should return pricing information', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'code' });

        expect(response.status).toBe(200);
        expect(response.body.pricing).toBeDefined();
        expect(response.body.pricing.service).toBe('code');
        expect(response.body.pricing.price).toBe('$0.015');
      });
    });

    describe('validation errors', () => {
      it('should return 400 for missing query parameter', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ service: 'general' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toBeInstanceOf(Array);
      });

      it('should return 400 for missing service parameter', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test query' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for empty query', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: '', service: 'general' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for query that is too long', async () => {
        const longQuery = 'a'.repeat(1001);
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: longQuery, service: 'general' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for maxResults below minimum', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'general', maxResults: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for maxResults above maximum', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'general', maxResults: 21 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for unknown service', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'unknown-service' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Service not found');
      });

      it('should include field information in validation errors', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ service: 'general' });

        expect(response.status).toBe(400);
        expect(response.body.details[0]).toHaveProperty('field');
        expect(response.body.details[0]).toHaveProperty('message');
      });
    });

    describe('response headers', () => {
      it('should return JSON content type', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', service: 'general' });

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });
  });
});
