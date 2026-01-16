import { Request, Response, NextFunction } from 'express';
import { ragQuerySchema, RagQueryResponse } from './types.js';
import { getReppoService } from '../../services/reppo/index.js';
import { getServiceRegistry } from '../../services/catalog/index.js';
import { ServiceNotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export async function queryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, service, maxResults } = ragQuerySchema.parse(req.query);

    // Validate service exists
    const registry = getServiceRegistry();
    const serviceInfo = registry.getService(service);
    if (!serviceInfo) {
      throw new ServiceNotFoundError(service);
    }

    logger.info('Processing RAG query', { query: q, service, maxResults });

    const reppoService = getReppoService();
    const result = await reppoService.broadcastRFD({
      service,
      query: q,
      maxResults,
    });

    // Build response time by subnet
    const responseTimeBySubnet: Record<string, number> = {};
    const subnets: string[] = [];

    for (const subnetResponse of result.subnetResponses) {
      responseTimeBySubnet[subnetResponse.subnet] = subnetResponse.responseTime;
      subnets.push(subnetResponse.subnet);
    }

    const response: RagQueryResponse = {
      query: q,
      service,
      results: result.data.map((item) => ({
        text: item.text,
        relevanceScore: item.score,
        source: item.source,
      })),
      provenance: {
        subnets,
        totalSources: result.subnetResponses.length,
        responseTimeBySubnet,
      },
      qualityScore: Math.round(result.confidence * 100) / 100,
      processingTimeMs: result.processingTime,
      pricing: {
        service,
        price: serviceInfo.pricePerQuery,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
