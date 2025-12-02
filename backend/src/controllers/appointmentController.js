import Appointment from '../models/Appointment.js';

export async function createAppointment(req, res) {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      symptoms,
      department,
      doctorName,
      doctorSpecialization,
      appointmentDate,
      appointmentTime,
      consultationFee,
      paymentMethod
    } = req.body;

    const appointmentId = 'AP' + Date.now().toString().slice(-8);

    const appointment = new Appointment({
      appointmentId,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      symptoms,
      department,
      doctorName,
      doctorSpecialization,
      appointmentDate: new Date(appointmentDate + 'T' + appointmentTime),
      appointmentTime,
      consultationFee,
      paymentMethod,
      appointmentStatus: paymentMethod === 'online' ? 'confirmed' : 'booked'
    });

    await appointment.save();
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getAppointments(req, res) {
  try {
    const { patientPhone } = req.query;
    let query = {};
    if (patientPhone) {
      query.patientPhone = patientPhone;
    }
    const appointments = await Appointment.find(query).sort({ bookedAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAppointmentById(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateAppointment(req, res) {
  try {
    const { appointmentStatus, paymentStatus } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { appointmentStatus, paymentStatus },
      { new: true }
    );
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { appointmentStatus: 'cancelled' },
      { new: true }
    );
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function checkSlotAvailability(req, res) {
  try {
    const { doctorName, appointmentDate, appointmentTime } = req.query;

    const existingAppointment = await Appointment.findOne({
      doctorName,
      appointmentDate: {
        $gte: new Date(appointmentDate),
        $lt: new Date(new Date(appointmentDate).getTime() + 24 * 60 * 60 * 1000)
      },
      appointmentTime,
      appointmentStatus: { $ne: 'cancelled' }
    });

    res.json({ success: true, available: !existingAppointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
