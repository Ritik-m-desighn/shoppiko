// routes/orderRoutes.js

import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder, // <-- NEW IMPORT
  getOrders,
  updateOrderToDelivered
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Route to cancel an order (requires authentication)
router.put('/:id/cancel', protect, cancelOrder); // <-- NEW ROUTE

// --- Admin Only Routes (Uncomment if implementing admin panel later) ---
// router.route('/').get(protect, getOrders);
// router.route('/:id/deliver').put(protect, updateOrderToDelivered);

export default router;
