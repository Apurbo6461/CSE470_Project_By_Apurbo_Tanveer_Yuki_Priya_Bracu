const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date
  },
  nextAvailableDate: {
    type: Date
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  healthInfo: {
    weight: Number,
    height: Number,
    lastMedicalCheckup: Date,
    healthConditions: [String]
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for location-based queries
donorSchema.index({ location: '2dsphere' });

// Update timestamp on save
donorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donor', donorSchema);