import request from 'supertest';
import { createTestApp } from './helpers.js';
import type { Application } from 'express';

describe('RAG API Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/rag/query', () => {
    describe('successful queries', () => {
      it('should return results for valid query', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'What is machine learning?' });

        expect(response.status).toBe(200);
        expect(response.body.query).toBe('What is machine learning?');
        expect(response.body.service).toBe('general');
        expect(response.body.results).toBeInstanceOf(Array);
        expect(response.body.results.length).toBeGreaterThan(0);
        expect(response.body.provenance).toBeInstanceOf(Array);
        expect(response.body.qualityScore).toBeDefined();
        expect(response.body.processingTimeMs).toBeGreaterThan(0);
      });

      it('should use custom service when provided', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test query', service: 'custom-service' });

        expect(response.status).toBe(200);
        expect(response.body.service).toBe('custom-service');
      });

      it('should respect maxResults parameter', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test query', maxResults: 2 });

        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(2);
      });

      it('should return results with correct structure', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', maxResults: 1 });

        expect(response.status).toBe(200);

        const result = response.body.results[0];
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('relevanceScore');
        expect(result).toHaveProperty('source');
        expect(typeof result.text).toBe('string');
        expect(typeof result.relevanceScore).toBe('number');
        expect(typeof result.source).toBe('string');
      });

      it('should return provenance matching sources', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', maxResults: 3 });

        expect(response.status).toBe(200);

        const sources = response.body.results.map(
          (r: { source: string }) => r.source
        );
        const provenance = response.body.provenance;

        // All sources should be in provenance
        sources.forEach((source: string) => {
          expect(provenance).toContain(source);
        });
      });

      it('should return quality score between 0 and 1', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test' });

        expect(response.status).toBe(200);
        expect(response.body.qualityScore).toBeGreaterThanOrEqual(0);
        expect(response.body.qualityScore).toBeLessThanOrEqual(1);
      });
    });

    describe('validation errors', () => {
      it('should return 400 for missing query parameter', async () => {
        const response = await request(app).get('/api/rag/query');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toBeInstanceOf(Array);
      });

      it('should return 400 for empty query', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: '' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for query that is too long', async () => {
        const longQuery = 'a'.repeat(1001);
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: longQuery });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for maxResults below minimum', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', maxResults: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for maxResults above maximum', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test', maxResults: 21 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Error');
      });

      it('should include field information in validation errors', async () => {
        const response = await request(app).get('/api/rag/query');

        expect(response.status).toBe(400);
        expect(response.body.details[0]).toHaveProperty('field');
        expect(response.body.details[0]).toHaveProperty('message');
      });
    });

    describe('response headers', () => {
      it('should return JSON content type', async () => {
        const response = await request(app)
          .get('/api/rag/query')
          .query({ q: 'Test' });

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });
  });
});
