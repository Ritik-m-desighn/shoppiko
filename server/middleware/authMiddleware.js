import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes in react next use it like this is more safe and secure that cookie one is not wrong but vunerable !
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;//our browser have a header called authorization which sends token Authorization: Bearer <jwt_token>


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];// how accesing ->(Bearer abc.def.ghi → abc.def.ghi).


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user object (excluding password) to the request
    req.user = await User.findById(decoded.id).select('-password');//if verfy scessfully it has a id it gives you as playback you can acees it but not password for future use 

    next(); // Move to the next middleware/route handler
  } catch (err) {
    console.error('❌ Auth Middleware Error:', err.message);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
