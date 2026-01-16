import 'dotenv/config';
import { createServer } from './server.js';
import { env } from './config/index.js';
import { logger } from './utils/logger.js';

const server = createServer();

server.listen(env.PORT, () => {
  logger.info(`x402 Gateway running on port ${env.PORT}`, {
    network: env.NETWORK,
    facilitator: env.FACILITATOR_URL,
    environment: env.NODE_ENV,
  });
  logger.info(`Health check: http://localhost:${env.PORT}/health`);
  logger.info(`RAG endpoint: http://localhost:${env.PORT}/api/rag/query?q=your-query`);
});
