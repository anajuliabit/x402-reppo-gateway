import { Request, Response, NextFunction } from 'express';
import { ragQuerySchema, RagQueryResponse } from './types.js';
import { getReppoService } from '../../services/reppo/index.js';
import { logger } from '../../utils/logger.js';

export async function queryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, service, maxResults } = ragQuerySchema.parse(req.query);

    logger.info('Processing RAG query', { query: q, service, maxResults });

    const reppoService = getReppoService();
    const result = await reppoService.broadcastRFD({
      service,
      query: q,
      maxResults,
    });

    const response: RagQueryResponse = {
      query: q,
      service,
      results: result.data.map((item) => ({
        text: item.text,
        relevanceScore: item.score,
        source: item.source,
      })),
      provenance: result.sources,
      qualityScore: Math.round(result.confidence * 100) / 100,
      processingTimeMs: result.processingTime,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
