// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./config/db');
connectDB();

const app = express();

// Diagnostic logger
// app.use((req, res, next) => {
//   console.log('INCOMING:', req.method, req.originalUrl, 'content-type:', req.headers['content-type']);
//   next();
// });

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// ROUTES
// ======================

// Patient routes
try {
  const patientRoutes = require('./routes/patientRoutes');
  app.use('/api/patients', patientRoutes);
  console.log('Mounted patientRoutes');
} catch (err) {
  console.error('Failed to mount patientRoutes:', err);
}

// Blood donor routes
try {
  const bloodDonorRoutes = require('./routes/bloodDonorRoutes');
  app.use('/api/blood', bloodDonorRoutes);
  console.log('Mounted bloodDonorRoutes');
} catch (err) {
  console.error('Failed to mount bloodDonorRoutes:', err);
}

// Auth routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('Mounted authRoutes');
} catch (err) {
  console.error('Failed to mount authRoutes:', err);
}

// Admin routes
try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('Mounted adminRoutes');

} catch (err) {
  console.error('Failed to mount adminRoutes:', err);
}

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Global error handler
app.use((error, req, res, next) => {
  console.error('GLOBAL ERROR HANDLER:', error);
  res.status(error && error.status ? error.status : 500)
     .json({ message: error && error.message ? error.message : 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Add a simple route to handle the root ("/") URL
// app.get('/', (req, res) => {
//   res.send('Server is running and ready to accept requests!');
// });

