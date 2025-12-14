const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  originalname: String,
  filename: String,
  mimetype: String,
  url: String
});

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String },
  sex: { type: String },
  age: { type: Number },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  files: [FileSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
