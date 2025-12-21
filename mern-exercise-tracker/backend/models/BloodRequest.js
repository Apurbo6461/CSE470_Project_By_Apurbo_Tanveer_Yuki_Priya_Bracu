const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requesterUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

  requesterInfo: {
    patientId: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, default: '' }
  },

  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },

  bloodGroup: { type: String, required: true, trim: true, index: true },
  units: { type: Number, default: 1 },
  urgency: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  message: { type: String, default: '' },

  status: { type: String, enum: ['open','fulfilled','cancelled'], default: 'open' },

  // Make location fully optional — do NOT set any defaults here.
  // Only set `location` on the document when you have valid coordinates.
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // optional; do not set default
    }
  },

  responses: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    contactPhone: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// 2dsphere index (documents with no location are fine)
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodRequest', requestSchema);