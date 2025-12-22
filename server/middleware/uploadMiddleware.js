// server/middleware/uploadMiddleware.js

import multer from 'multer';
import path from 'path'; // Node.js built-in module for path manipulation
import fs from 'fs'; // Node.js built-in module for file system operations

// Define the directory where uploaded files will be stored
const uploadDir = 'uploads/'; // This directory should be at the root of your 'server' folder

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
}

// Set up storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 'uploads/' is relative to the directory where Node.js process is started
    cb(null, uploadDir); // Store files in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: fieldname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure Multer upload middleware
const upload = multer({
  storage: storage,
  // Optional: File filter to allow only certain file types
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Allowed file extensions
    const mimetype = filetypes.test(file.mimetype); // Check mimetype
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check extension

    if (mimetype && extname) {
      return cb(null, true); // Accept file
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'), false); // Reject file
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit (optional)
  },
});

export default upload;
