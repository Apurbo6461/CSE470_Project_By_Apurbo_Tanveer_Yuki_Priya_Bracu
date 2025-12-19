const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  age: {
    type: Number
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  files: [{
    filename: String,
    originalname: String,
    url: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

