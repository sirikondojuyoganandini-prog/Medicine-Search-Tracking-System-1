import express from 'express';
import {
  getAdminStats,
  getAllCustomers,
  deleteCustomer,
  getAllShops,
  toggleApproveShop,
  toggleFreezeShop,
  deleteShop,
  getAllMedicinesAdmin,
  deleteMedicineAdmin,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAllFeedbacksAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require Admin role
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/customers', getAllCustomers);
router.delete('/customers/:id', deleteCustomer);

router.get('/shops', getAllShops);
router.patch('/shops/:id/approve', toggleApproveShop);
router.patch('/shops/:id/freeze', toggleFreezeShop);
router.delete('/shops/:id', deleteShop);

router.get('/medicines', getAllMedicinesAdmin);
router.delete('/medicines/:id', deleteMedicineAdmin);

router.get('/orders', getAllOrdersAdmin);
router.patch('/orders/:id/status', updateOrderStatusAdmin);

router.get('/feedbacks', getAllFeedbacksAdmin);

export default router;
