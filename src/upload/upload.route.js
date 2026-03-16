import { Router } from "express";
import { upload } from "./upload.middleware.js";
import { upload_controller, healthCheck } from "./upload.controller.js";

const router = Router();

// Health check
router.get('/health', healthCheck);

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, upload_controller);

export default router;