import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import departmentRoutes from './src/routes/departmentRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import usersRouter from './src/routes/users.js';

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// MongoDB connection helper
async function connectDB() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_db';
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.warn('MongoDB connection failed:', err && err.message ? err.message : err);
        // don't crash: app can fall back to in-memory models if implemented
    }
}

// Basic health route
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// API routes
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', usersRouter);

// Port and server start with graceful error handling
const DEFAULT_PORT = 5001;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

async function start() {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`Hospital API server running on port ${PORT}`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Use a different PORT or stop the process using this port.`);
            process.exit(1);
        }
        console.error('Server error:', err);
        process.exit(1);
    });

    const shutdown = async () => {
        console.log('Shutting down server...');
        server.close(() => {
            console.log('HTTP server closed');
            mongoose.connection.close(false, () => {
                console.log('MongoDB connection closed');
                process.exit(0);
            });
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

start();

