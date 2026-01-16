import { z } from 'zod';

export const ragQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
  service: z.string().optional().default('general'),
  maxResults: z.coerce.number().min(1).max(20).optional().default(5),
});

export type RagQueryInput = z.infer<typeof ragQuerySchema>;

export interface RagQueryResponse {
  query: string;
  service: string;
  results: Array<{
    text: string;
    relevanceScore: number;
    source: string;
  }>;
  provenance: string[];
  qualityScore: number;
  processingTimeMs: number;
}
