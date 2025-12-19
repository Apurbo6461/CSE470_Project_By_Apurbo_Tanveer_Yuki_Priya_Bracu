const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Generate unique patient ID
function generatePatientId() {
  return 'PAT' + Date.now() + Math.floor(Math.random() * 1000);
}

// GET route - list all patients
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const patients = await Patient.find().sort({ createdAt: -1 });
      return res.json({ ok: true, patients });
    }
    res.json({ ok: true, msg: 'Patient routes OK - No DB connection' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST route - create new patient
router.post('/', upload.array('historyFiles', 10), async (req, res) => {
  try {
    const { name, sex, age, phone, email, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const patientId = generatePatientId();
    
    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/uploads/${file.filename}`
    })) : [];

    const patientData = {
      patientId,
      name,
      sex: sex || 'Male',
      age: age ? parseInt(age) : undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      files
    };

    // Try to save to MongoDB if connected
    let patient;
    if (mongoose.connection.readyState === 1) {
      patient = await Patient.create(patientData);
    } else {
      // In-memory fallback (for development without DB)
      patient = patientData;
      console.log('Patient created (in-memory):', patientData);
    }

    res.status(201).json({
      ok: true,
      message: 'Patient created successfully',
      ...patient
    });
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: err.message || 'Failed to create patient' });
  }
});

// GET route - get patient by ID
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const patient = await Patient.findOne({ patientId: req.params.id });
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      return res.json({ ok: true, patient });
    }
    res.status(503).json({ error: 'Database not connected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
