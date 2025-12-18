const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
const STORAGE_MODE = process.env.STORAGE_MODE || 'file'; // 'mongodb' or 'file'

let isMongoConnected = false;

const connectDB = async () => {
  // Only attempt MongoDB if explicitly enabled
  if (STORAGE_MODE === 'mongodb') {
    try {
      await mongoose.connect(MONGO_URI, {});
      isMongoConnected = true;
      console.log('✓ MongoDB connected');
    } catch (err) {
      console.warn('⚠ MongoDB connection failed:', err.message);
      console.warn('Continuing with file-based storage.');
      isMongoConnected = false;
    }
  } else {
    console.log('✓ Using file-based storage (set STORAGE_MODE=mongodb to use MongoDB)');
  }
};

module.exports = { connectDB, isMongoConnected: () => isMongoConnected, STORAGE_MODE };
