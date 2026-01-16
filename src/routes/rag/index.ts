import { Router } from 'express';
import { queryHandler } from './query.js';
import { servicesHandler } from './services.js';

const router = Router();

router.get('/query', queryHandler);
router.get('/services', servicesHandler);

export { router as ragRouter };
