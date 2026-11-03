import express from 'express';
import {
  createMedicine,
  getMyMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
} from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / Customer search route
router.get('/search', searchMedicines);

// Shop-specific routes
router.post('/', protect, authorizeRoles('shop'), createMedicine);
router.get('/shop/my', protect, authorizeRoles('shop'), getMyMedicines);
router.put('/:id', protect, authorizeRoles('shop'), updateMedicine);
router.delete('/:id', protect, authorizeRoles('shop'), deleteMedicine);

// Get single medicine details
router.get('/:id', getMedicineById);

export default router;
