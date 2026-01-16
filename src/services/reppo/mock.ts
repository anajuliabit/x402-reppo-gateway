import {
  ReppoService,
  RFDRequest,
  RFDResponse,
  RFDResult,
  SubnetResponse,
} from './types.js';
import { logger } from '../../utils/logger.js';
import { getServiceRegistry } from '../catalog/index.js';

// Default subnets for unknown services
const DEFAULT_SUBNETS = ['subnet-1', 'subnet-2'];

export class MockReppoService implements ReppoService {
  async broadcastRFD(request: RFDRequest): Promise<RFDResponse> {
    const startTime = Date.now();

    logger.debug('Broadcasting mock RFD', {
      service: request.service,
      query: request.query,
    });

    // Get subnets for this service from registry
    const registry = getServiceRegistry();
    const mapping = registry.getSubnetMapping(request.service);
    const subnets = mapping?.subnets ?? DEFAULT_SUBNETS;

    // Simulate querying each subnet concurrently
    const subnetResponses = await this.querySubnets(subnets, request);

    // Aggregate results from all subnets
    const aggregatedResults = this.aggregateResults(
      subnetResponses,
      request.maxResults ?? 5
    );

    const processingTime = Date.now() - startTime;

    logger.debug('Mock RFD completed', {
      processingTime,
      resultsCount: aggregatedResults.length,
      subnetsQueried: subnets.length,
    });

    return {
      data: aggregatedResults,
      subnetResponses,
      confidence: 0.85 + Math.random() * 0.1,
      processingTime,
    };
  }

  private async querySubnets(
    subnets: string[],
    request: RFDRequest
  ): Promise<SubnetResponse[]> {
    // Simulate concurrent subnet queries
    const promises = subnets.map((subnet) =>
      this.querySubnet(subnet, request)
    );
    return Promise.all(promises);
  }

  private async querySubnet(
    subnet: string,
    request: RFDRequest
  ): Promise<SubnetResponse> {
    const startTime = Date.now();

    // Simulate variable network delay per subnet (50-150ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 50 + Math.random() * 100)
    );

    const responseTime = Date.now() - startTime;

    // Generate 2-4 results per subnet
    const resultCount = Math.floor(Math.random() * 3) + 2;
    const results: RFDResult[] = [];

    for (let i = 0; i < resultCount; i++) {
      const documentId = `doc-${Math.random().toString(36).substring(2, 10)}`;

      results.push({
        text: `[Mock] Result from ${subnet} for "${request.query}" in ${request.service} domain. This is placeholder data that will be replaced with real Reppo subnet data.`,
        score: Math.round((0.95 - i * 0.1 + Math.random() * 0.05) * 100) / 100,
        source: {
          subnet,
          document: documentId,
          uri: `reppo:${request.service}:${subnet}:${documentId}`,
        },
        metadata: {
          type: 'annotation',
          verified: Math.random() > 0.3,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return {
      subnet,
      results,
      responseTime,
    };
  }

  private aggregateResults(
    subnetResponses: SubnetResponse[],
    maxResults: number
  ): RFDResult[] {
    // Collect all results from all subnets
    const allResults: RFDResult[] = [];

    for (const response of subnetResponses) {
      allResults.push(...response.results);
    }

    // Sort by score descending
    allResults.sort((a, b) => b.score - a.score);

    // Return top N results
    return allResults.slice(0, Math.min(maxResults, 5));
  }
}
