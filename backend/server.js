const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files from backend/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patients', patientRoutes);

// Serve frontend in production (frontend built to ../frontend/dist)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html')));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT} (bound to 0.0.0.0), pid=${process.pid}`);
});

// lightweight debug endpoint
app.get('/__debug', (req, res) => {
  res.json({ ok: true, pid: process.pid, env: process.env.STORAGE_MODE || 'file' });
});

// simple ping route
app.get('/ping', (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// global error handlers for more reliable debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

function shutdown() {
  console.log('Shutting down server...');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
