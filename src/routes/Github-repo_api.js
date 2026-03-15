import { Router } from 'express';
import { ingestRepo } from '../controllers/ingestionController.js';

const router = Router();

router.get('/repo/ingest', ingestRepo);

export default router;