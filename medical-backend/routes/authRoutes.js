import express from 'express';
import {
  registerCustomer,
  registerShop,
  registerAdmin,
  login,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-customer', registerCustomer);
router.post('/register-shop', registerShop);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
