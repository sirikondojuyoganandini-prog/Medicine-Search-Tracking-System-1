import express from 'express';
import {
  submitFeedback,
  checkGeofence,
  getUserGeofences,
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/feedback', submitFeedback);
router.post('/geofence/check', checkGeofence);
router.get('/geofence', getUserGeofences);

export default router;
