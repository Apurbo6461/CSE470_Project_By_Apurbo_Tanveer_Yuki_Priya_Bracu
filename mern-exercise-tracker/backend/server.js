const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Import the auth routes
const adminRoutes = require('./routes/adminRoutes'); // Import the admin routes
const testRoutes = require('./routes/testRoutes'); // Import the test routes (if needed)
const bloodDonorRoutes = require("./routes/bloodDonorRoutes");
dotenv.config();  // Load environment variables from .env

const app = express();

// Middleware
app.use(cors());         // Enable CORS globally for all routes
app.use(express.json()); // Parse incoming JSON requests

// Use auth routes for /api/auth path
app.use('/api/auth', authRoutes);  // Mount the authentication routes
app.use('/api/admin', adminRoutes); // Mount the admin routes
app.use('/api', testRoutes);       // Mount the test routes if you need them
app.use("/api/blood", require("./routes/bloodDonorRoutes"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // No need for options like useNewUrlParser or useUnifiedTopology
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if MongoDB connection fails
  });

// Handle 404 errors (route not found)
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Generic error handler for all uncaught errors
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ message: error.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
