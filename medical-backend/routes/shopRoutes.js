import express from 'express';
import {
  getShopProfile,
  updateShopProfile,
  getShopOrders,
  updateShopOrderStatus,
  getShopFeedback,
  replyToFeedback,
} from '../controllers/shopController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('shop'));

router.get('/profile', getShopProfile);
router.put('/profile', updateShopProfile);

router.get('/orders', getShopOrders);
router.patch('/orders/:id/status', updateShopOrderStatus);

router.get('/feedbacks', getShopFeedback);
router.post('/feedbacks/:id/reply', replyToFeedback);

export default router;
