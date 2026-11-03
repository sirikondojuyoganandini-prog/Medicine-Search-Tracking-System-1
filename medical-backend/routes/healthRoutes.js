import express from 'express';
import { getHealthProfile, updateHealthProfile } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHealthProfile);
router.put('/', updateHealthProfile);

export default router;
