import { z } from 'zod';

export const ragQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
  service: z.string().min(1, 'Service is required'),
  maxResults: z.coerce.number().min(1).max(20).optional().default(5),
});

export type RagQueryInput = z.infer<typeof ragQuerySchema>;

export interface ResultSource {
  subnet: string;
  document: string;
  uri: string;
}

export interface RagResult {
  text: string;
  relevanceScore: number;
  source: ResultSource;
}

export interface Provenance {
  subnets: string[];
  totalSources: number;
  responseTimeBySubnet: Record<string, number>;
}

export interface Pricing {
  service: string;
  price: string;
}

export interface RagQueryResponse {
  query: string;
  service: string;
  results: RagResult[];
  provenance: Provenance;
  qualityScore: number;
  processingTimeMs: number;
  pricing: Pricing;
}
