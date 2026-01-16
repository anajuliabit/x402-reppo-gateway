import { Router, Request, Response } from 'express';
import { env } from '../config/index.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    network: env.NETWORK,
  });
});

router.get('/ready', (_req: Request, res: Response) => {
  res.json({
    ready: true,
    services: {
      reppo: 'mock', // TODO: Update when real Reppo integration is available
    },
  });
});

export { router as healthRouter };
