import { Router } from 'express';
import { queryHandler } from './query.js';

const router = Router();

router.get('/query', queryHandler);

export { router as ragRouter };
