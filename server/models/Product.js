    // models/Product.js

    import mongoose from 'mongoose';

    const productSchema = new mongoose.Schema({
      // Reference to the user who created the product (the seller)
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      createdBy: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    }, {
      timestamps: true,
    });

    const Product = mongoose.model('Product', productSchema);

    export default Product;
    