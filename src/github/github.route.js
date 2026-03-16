import { Router } from 'express';
import { ingestRepo } from './github.controller.js';

const router = Router();

router.get('/repo/ingest', ingestRepo);

export default router;