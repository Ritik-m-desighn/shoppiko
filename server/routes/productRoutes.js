// routes/productRoutes.js

import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Routes for Product operations
// POST to create a new product (requires auth and file upload)
router.post('/', protect, upload.single('productImage'), createProduct);

// GET all products (public)
router.get('/', getProducts);

// GET a single product by ID (public)
router.get('/:id', getProductById);

// PUT to update a product by ID (requires auth AND file upload middleware)
// !!! CRITICAL ADDITION: Multer middleware for PUT request !!!
router.put('/:id', protect, upload.single('productImage'), updateProduct); // <-- ADDED upload.single('productImage')

// DELETE a product by ID (requires auth)
router.delete('/:id', protect, deleteProduct);

export default router;
