const Patient = require('../models/Patient');

function generatePatientId() {
  return 'PAT-' + Date.now().toString(36).toUpperCase();
}

exports.createPatient = async (req, res) => {
  try {
    const { name, sex, age, phone, email, address } = req.body;
    const files = (req.files || []).map(f => ({
      originalname: f.originalname,
      filename: f.filename,
      mimetype: f.mimetype,
      url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`
    }));

    const patient = new Patient({
      patientId: generatePatientId(),
      name,
      sex,
      age: age ? Number(age) : undefined,
      phone,
      email,
      address,
      files
    });

    await patient.save();
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
