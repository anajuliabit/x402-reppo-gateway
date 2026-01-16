import { MockReppoService } from '../../../src/services/reppo/mock.js';
import type { RFDRequest } from '../../../src/services/reppo/types.js';

describe('MockReppoService', () => {
  let service: MockReppoService;

  beforeEach(() => {
    service = new MockReppoService();
  });

  describe('broadcastRFD', () => {
    it('should return results for a valid request', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'What is AI?',
        maxResults: 3,
      };

      const response = await service.broadcastRFD(request);

      expect(response).toBeDefined();
      expect(response.data).toHaveLength(3);
      expect(response.sources).toBeDefined();
      expect(response.sources.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.processingTime).toBeGreaterThan(0);
    });

    it('should respect maxResults parameter', async () => {
      const request: RFDRequest = {
        service: 'test',
        query: 'Test query',
        maxResults: 2,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data).toHaveLength(2);
    });

    it('should default to 5 results when maxResults is not provided', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'Test query',
      };

      const response = await service.broadcastRFD(request);

      expect(response.data).toHaveLength(5);
    });

    it('should cap results at 5 even if maxResults is higher', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'Test query',
        maxResults: 10,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data).toHaveLength(5);
    });

    it('should include query in result text', async () => {
      const query = 'What is machine learning?';
      const request: RFDRequest = {
        service: 'ai',
        query,
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data[0].text).toContain(query);
    });

    it('should include service in result source', async () => {
      const serviceName = 'custom-service';
      const request: RFDRequest = {
        service: serviceName,
        query: 'Test',
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data[0].source).toContain(serviceName);
      expect(response.data[0].source).toMatch(/^reppo:custom-service:subnet-\d+$/);
    });

    it('should return decreasing scores for results', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'Test',
        maxResults: 3,
      };

      const response = await service.broadcastRFD(request);

      for (let i = 1; i < response.data.length; i++) {
        expect(response.data[i].score).toBeLessThan(response.data[i - 1].score);
      }
    });

    it('should include metadata in results', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'Test',
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data[0].metadata).toBeDefined();
      expect(response.data[0].metadata?.type).toBe('annotation');
      expect(response.data[0].metadata?.timestamp).toBeDefined();
      expect(typeof response.data[0].metadata?.verified).toBe('boolean');
    });

    it('should have processing time that reflects simulated delay', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'Test',
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      // Mock service has 100-300ms simulated delay
      expect(response.processingTime).toBeGreaterThanOrEqual(100);
      expect(response.processingTime).toBeLessThan(500);
    });
  });
});
