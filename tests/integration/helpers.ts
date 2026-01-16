import express, { Application } from 'express';
import { errorHandler } from '../../src/middleware/error.js';
import { healthRouter } from '../../src/routes/health.js';
import { ragRouter } from '../../src/routes/rag/index.js';

/**
 * Creates a test application without payment middleware.
 * This allows testing the RAG endpoints directly.
 */
export function createTestApp(): Application {
  const app = express();

  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/api/rag', ragRouter);
  app.use(errorHandler);

  return app;
}
