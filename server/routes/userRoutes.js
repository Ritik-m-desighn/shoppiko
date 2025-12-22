// routes/userRoutes.js
import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js'; // Protect these routes

const router = express.Router();

// Apply protect middleware to all routes in this router if desired, or individually
router.route('/profile')
  .get(protect, getUserProfile) // Get user profile (protected)
  .put(protect, updateUserProfile); // Update user profile (protected)

export default router;