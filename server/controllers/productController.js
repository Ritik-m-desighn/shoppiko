// controllers/productController.js

import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req, res) => {
  const { title, description, price, category, stock, discount } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.jpg';

  // --- ADDED CONSOLE LOGS FOR DEBUGGING ---
  console.log('✅ createProduct: Authenticated User ID:', req.user?._id);
  console.log('✅ createProduct: Authenticated User Name:', req.user?.name); // IMPORTANT: Check this output
  console.log('✅ createProduct: Authenticated User Email:', req.user?.email);
  // ----------------------------------------

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, please log in.' });
  }

  try {
    const product = new Product({
      user: req.user._id,
      title,
      description,
      price: parseFloat(price),
      imageUrl,
      category,
      stock: parseInt(stock, 10),
      discount: parseFloat(discount) || 0,
      createdBy: {
        _id: req.user._id,
        name: req.user.name, // This is where the name is initially saved
        email: req.user.email,
      },
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error('❌ Product creation error:', err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinker_err) => {
        if (unlinker_err) console.error('Error deleting failed upload:', unlinker_err);
      });
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// @desc    Get all products (public) or specific user's products (myProducts=true)
// @route   GET /api/products
// @access  Public (for all products), Private (for myProducts=true)
export const getProducts = async (req, res) => {
  const { myProducts } = req.query; // Check for myProducts query parameter
  let query = {}; // Initialize an empty query object

  // This block runs ONLY if myProducts=true is present
  if (myProducts === 'true') {
    let userId = null;
    let token = null;

    // Manually extract and verify token if it exists in the header for 'myProducts'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id; // Get user ID from token
      } catch (error) {
        console.error('❌ Token verification failed for myProducts query:', error);
        // If token is invalid for myProducts query, treat as unauthorized
        return res.status(401).json({ message: 'Not authorized, invalid token for viewing your products.' });
      }
    }

    // If myProducts=true is set but no valid user ID found (no token or invalid token)
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, please log in to view your products.' });
    }
    query.user = userId; // Filter products by the authenticated user's ID
  }
  // If myProducts is NOT 'true', the query remains empty ({}), fetching all products.
  // This is the default for the homepage.

  try {
    const products = await Product.find(query); // Use the dynamic query
    res.status(200).json(products);
  } catch (err) {
    console.error('❌ Get products error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('❌ Get product by ID error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
export const updateProduct = async (req, res) => {
  const { title, description, price, category, stock, discount } = req.body;
  const productId = req.params.id;
  let imageUrl;

  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  // --- ADDED CONSOLE LOGS FOR DEBUGGING ---
  console.log('✅ updateProduct: Authenticated User ID:', req.user?._id);
  console.log('✅ updateProduct: Authenticated User Name:', req.user?.name); // IMPORTANT: Check this output
  console.log('✅ updateProduct: Authenticated User Email:', req.user?.email);
  // ----------------------------------------

  try {
    let product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      if (req.file) {
        fs.unlink(req.file.path, (unlinker_err) => {
          if (unlinker_err) console.error('Error deleting unauthorized upload:', unlinker_err);
        });
      }
      return res.status(403).json({ message: 'Not authorized to update this product.' });
    }

    if (req.file && product.imageUrl && product.imageUrl !== '/uploads/placeholder.jpg') {
      const oldImagePath = path.join(process.cwd(), product.imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old product image:', err);
      });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = parseFloat(price) || product.price;
    product.category = category || product.category;
    product.stock = parseInt(stock, 10) || product.stock;
    product.discount = parseFloat(discount) || product.discount;
    product.imageUrl = imageUrl || product.imageUrl;

    // --- FIX: Update the createdBy.name field during product update ---
    if (req.user && req.user.name) {
      product.createdBy.name = req.user.name;
      // You might also want to update _id and email if they could change (though typically _id is static)
      product.createdBy._id = req.user._id;
      product.createdBy.email = req.user.email;
    }
    // -----------------------------------------------------------------

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (err) {
    console.error('❌ Product update error:', err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinker_err) => {
        if (unlinker_err) console.error('Error deleting failed upload on update:', unlinker_err);
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Failed to update product' });
  }
};


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product.' });
    }

    if (product.imageUrl && product.imageUrl !== '/uploads/placeholder.jpg') {
      const imagePath = path.join(process.cwd(), product.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting product image file:', err);
      });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error('❌ Product deletion error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
