// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    default: () => `PAT${Date.now().toString().slice(-9)}` // simple default
  },
  name: { type: String, required: true },
  sex: String,
  age: Number,
  phone: String,
  email: String,
  files: [String],
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);