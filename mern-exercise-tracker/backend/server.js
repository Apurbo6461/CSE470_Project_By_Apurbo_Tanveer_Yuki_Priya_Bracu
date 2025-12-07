// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Import the auth routes
const testRoutes = require('./routes/testRoutes'); // Import the test routes

dotenv.config();  // Load environment variables from .env

const app = express();

// Middleware
app.use(cors());         // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// Use auth routes for /api/auth path
app.use('/api/auth', authRoutes);  // Mount the authentication routes
app.use('/api', testRoutes);       // Mount the test routes

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)  // Remove the deprecated options (useNewUrlParser, useUnifiedTopology)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if MongoDB connection fails
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
