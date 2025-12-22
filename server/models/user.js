// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  // --- ADD THIS NEW FIELD ---
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'], // Define possible roles
    default: 'customer', // Most users will be customers by default
  },
  // -------------------------
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;