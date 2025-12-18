const persistenceService = require('../services/persistenceService');

function generatePatientId() {
  return 'PAT-' + Date.now().toString(36).toUpperCase();
}

/**
 * POST /api/patients - Create a new patient
 * MVC: Controller handles request/response, delegates to service
 */
exports.createPatient = async (req, res) => {
  try {
    const { name, sex, age, phone, email, address } = req.body;
    const files = (req.files || []).map(f => ({
      originalname: f.originalname,
      filename: f.filename,
      mimetype: f.mimetype,
      url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`
    }));

    const patientData = {
      patientId: generatePatientId(),
      name,
      sex,
      age: age ? Number(age) : undefined,
      phone,
      email,
      address,
      files,
      createdAt: new Date()
    };

    const saved = await persistenceService.savePatient(patientData);
    res.json(saved);
  } catch (err) {
    console.error('createPatient error:', err);
    res.status(500).json({ error: 'Failed to save patient' });
  }
};

/**
 * GET /api/patients/:id - Get patient by ID
 */
exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await persistenceService.getPatientById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    console.error('getPatient error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/patients - List all patients
 */
exports.listPatients = async (req, res) => {
  try {
    const patients = await persistenceService.listPatients();
    res.json(patients);
  } catch (err) {
    console.error('listPatients error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/patients/health - Health check
 */
exports.health = async (req, res) => {
  try {
    res.json({ ok: true, storageMode: process.env.STORAGE_MODE || 'file' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
