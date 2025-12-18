const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createPatient } = require('../controllers/patientController');
const { getPatient, listPatients, health } = require('../controllers/patientController');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage });

// POST /api/patients
router.post('/', upload.array('historyFiles'), createPatient);
router.get('/health', health);
router.get('/', listPatients);
router.get('/:id', getPatient);

module.exports = router;
