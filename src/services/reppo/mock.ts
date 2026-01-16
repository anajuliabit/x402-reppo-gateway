import { ReppoService, RFDRequest, RFDResponse } from './types.js';
import { logger } from '../../utils/logger.js';

export class MockReppoService implements ReppoService {
  async broadcastRFD(request: RFDRequest): Promise<RFDResponse> {
    const startTime = Date.now();

    logger.debug('Broadcasting mock RFD', { service: request.service, query: request.query });

    // Simulate network delay (100-300ms)
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    const processingTime = Date.now() - startTime;

    // Generate mock results based on service type
    const mockResults = this.generateMockResults(request);

    logger.debug('Mock RFD completed', { processingTime, resultsCount: mockResults.data.length });

    return {
      ...mockResults,
      processingTime,
    };
  }

  private generateMockResults(request: RFDRequest): Omit<RFDResponse, 'processingTime'> {
    const { service, query, maxResults = 5 } = request;

    const results = [];
    const sources = new Set<string>();

    for (let i = 0; i < Math.min(maxResults, 5); i++) {
      const subnetId = `subnet-${Math.floor(Math.random() * 10) + 1}`;
      const source = `reppo:${service}:${subnetId}`;
      sources.add(source);

      results.push({
        text: `[Mock] Result ${i + 1} for "${query}" from ${service} subnet. This is placeholder data that will be replaced with real Reppo subnet data when the RFD consumption pipeline is available.`,
        score: Math.round((0.95 - i * 0.05) * 100) / 100,
        source,
        metadata: {
          type: 'annotation',
          verified: Math.random() > 0.3,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return {
      data: results,
      sources: Array.from(sources),
      confidence: 0.85 + Math.random() * 0.1,
    };
  }
}
