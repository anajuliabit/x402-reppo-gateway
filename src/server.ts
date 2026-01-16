import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { payment } from './middleware/payment.js';
import { errorHandler } from './middleware/error.js';
import { requestLogger } from './middleware/logging.js';
import { healthRouter } from './routes/health.js';
import { ragRouter } from './routes/rag/index.js';
import { servicesHandler } from './routes/rag/services.js';

export function createServer(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Request parsing
  app.use(express.json());

  // Request logging
  app.use(requestLogger);

  // Health check endpoints (no payment required)
  app.use('/health', healthRouter);

  // Service catalog endpoint (no payment required - free)
  app.get('/api/rag/services', servicesHandler);

  // x402 payment middleware (protects routes below)
  app.use(payment);

  // Protected routes
  app.use('/api/rag', ragRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}
