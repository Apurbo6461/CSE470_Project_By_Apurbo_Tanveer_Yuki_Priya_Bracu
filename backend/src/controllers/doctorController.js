import Doctor from '../models/Doctor.js';

export async function getDoctors(req, res) {
  try {
    const { department } = req.query;
    let query = {};
    if (department) {
      query.department = department;
    }
    const doctors = await Doctor.find(query);
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDoctorById(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createDoctor(req, res) {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
