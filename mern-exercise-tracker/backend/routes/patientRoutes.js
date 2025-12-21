const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient'); // adjust path if needed

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

/**
 * POST /api/patients
 * Accepts multipart/form-data with fields: name, sex, age, phone, email, address
 * and files in field 'historyFiles' (multiple)
 */
router.post('/', upload.array('historyFiles'), async (req, res) => {
  try {
    const { name, sex, age, phone, email, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const emailNormalized = String(email).trim().toLowerCase();

    const files = (req.files || []).map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      url: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
      size: f.size
    }));

    const patientData = {
      name: String(name).trim(),
      sex: sex || undefined,
      age: age ? Number(age) : undefined,
      phone: phone || undefined,
      email: emailNormalized,
      address: address || undefined,
      files
    };

    const patient = new Patient(patientData);
    await patient.save();

    return res.status(201).json(patient);
  } catch (err) {
    console.error('patient create error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/patients/verify-requester
 * Body: { name, email }
 * Returns: { ok: true, patient, token } when found
 * The token is short-lived and has purpose 'verify_search'
 */
router.post('/verify-requester', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ ok: false, message: 'Email required' });

    const emailNormalized = String(email).trim().toLowerCase();

    // Try to find by email first (case-insensitive)
    let patient = await Patient.findOne({ email: emailNormalized }).lean();

    // If not found by email, try a fallback: match by name (case-insensitive substring)
    if (!patient && name) {
      const nameRegex = new RegExp(name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      patient = await Patient.findOne({ name: nameRegex }).lean();
    }

    if (!patient) {
      return res.status(404).json({ ok: false, message: 'No matching patient found' });
    }

    // Issue a short-lived verification token (used by frontend to call protected search)
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign(
      {
        purpose: 'verify_search',
        patientId: patient._id || patient.patientId,
        email: patient.email,
        name: patient.name
      },
      secret,
      { expiresIn: '15m' }
    );

    return res.json({ ok: true, patient, token });
  } catch (err) {
    console.error('verify-requester error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;