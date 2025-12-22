    // index.js

    import express from 'express';
    import mongoose from 'mongoose';
    import dotenv from 'dotenv';
    import cors from 'cors';
    import authRoutes from './routes/authRoutes.js';
    import userRoutes from './routes/userRoutes.js';
    import productRoutes from './routes/productRoutes.js';
    import orderRoutes from './routes/orderRoutes.js';
    import path from 'path';

    dotenv.config();
    const app = express();

    app.use(cors());
    app.use(express.json());

    // Serve static files from the 'uploads' directory
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // app.get('/', (req, res) => res.send('Server is running 🚀')); // Removed unnecessary log

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);

    // MongoDB Connection and Server Start
    const MONGO_URI = process.env.MONGO_URI;
    const PORT = process.env.PORT || 5000;

    mongoose.connect(MONGO_URI)
      .then(() => {
        console.log('✅ MongoDB connected'); // Keep this important connection log
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // Keep this important server start log
      })
      .catch((err) => {
        console.error('❌ DB Connection Error:', err.message); // Keep this important error log
      });
    