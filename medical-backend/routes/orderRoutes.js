import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

export default router;
