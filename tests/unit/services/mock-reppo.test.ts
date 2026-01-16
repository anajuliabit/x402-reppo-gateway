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
      expect(response.subnetResponses).toBeDefined();
      expect(response.subnetResponses.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.processingTime).toBeGreaterThan(0);
    });

    it('should respect maxResults parameter', async () => {
      const request: RFDRequest = {
        service: 'general',
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
        service: 'scientific',
        query,
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data[0].text).toContain(query);
    });

    it('should include structured source in results', async () => {
      const serviceName = 'scientific';
      const request: RFDRequest = {
        service: serviceName,
        query: 'Test',
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      expect(response.data[0].source).toHaveProperty('subnet');
      expect(response.data[0].source).toHaveProperty('document');
      expect(response.data[0].source).toHaveProperty('uri');
      expect(response.data[0].source.uri).toContain(serviceName);
    });

    it('should use service-specific subnets for known services', async () => {
      const request: RFDRequest = {
        service: 'scientific',
        query: 'Test',
        maxResults: 3,
      };

      const response = await service.broadcastRFD(request);

      // Scientific service uses subnet-3 and subnet-7
      const subnets = response.subnetResponses.map((r) => r.subnet);
      expect(subnets).toContain('subnet-3');
      expect(subnets).toContain('subnet-7');
    });

    it('should use default subnets for unknown services', async () => {
      const request: RFDRequest = {
        service: 'unknown-service',
        query: 'Test',
        maxResults: 3,
      };

      const response = await service.broadcastRFD(request);

      // Unknown services use default subnets
      const subnets = response.subnetResponses.map((r) => r.subnet);
      expect(subnets).toContain('subnet-1');
      expect(subnets).toContain('subnet-2');
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

      // Mock service has 50-150ms simulated delay per subnet
      expect(response.processingTime).toBeGreaterThanOrEqual(50);
      expect(response.processingTime).toBeLessThan(500);
    });

    it('should include response time per subnet', async () => {
      const request: RFDRequest = {
        service: 'general',
        query: 'Test',
        maxResults: 1,
      };

      const response = await service.broadcastRFD(request);

      for (const subnetResponse of response.subnetResponses) {
        expect(subnetResponse.responseTime).toBeGreaterThan(0);
      }
    });
  });
});
