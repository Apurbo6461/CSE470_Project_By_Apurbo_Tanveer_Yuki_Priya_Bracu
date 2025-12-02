import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String
  },
  patientAge: {
    type: Number
  },
  symptoms: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialization: {
    type: String
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  appointmentStatus: {
    type: String,
    enum: ['booked', 'confirmed', 'completed', 'cancelled'],
    default: 'booked'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
