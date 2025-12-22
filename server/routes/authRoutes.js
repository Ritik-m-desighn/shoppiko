import express from 'express';
import { register, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);//obvousily /api/auth/regsister you come here and you are sending register function thorugh post methods
router.post('/login', login);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    user: req.user,
  });
});

export default router;
