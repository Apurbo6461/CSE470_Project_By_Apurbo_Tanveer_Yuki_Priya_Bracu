const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: undefined }, // [lng, lat]
  address: { type: String, required: false } // <--- made optional
});

const BloodSchema = new mongoose.Schema({
  // other fields...
  requesterInfo: {
    patientId: { type: String, default: '' },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  bloodGroup: { type: String, required: true },
  units: { type: Number, default: 1 },
  urgency: { type: String, default: 'medium' },
  message: { type: String, default: '' },
  status: { type: String, default: 'open' },
  location: { type: LocationSchema, required: false }, // optional location
}, { timestamps: true });

// If you have a geo index, create it only when coordinates exist
BloodSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Blood', BloodSchema);