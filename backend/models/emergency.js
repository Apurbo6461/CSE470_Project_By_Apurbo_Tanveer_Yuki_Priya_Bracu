const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  emergencyType: {
    type: String,
    enum: ['accident', 'surgery', 'critical_illness', 'other'],
    default: 'other'
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
  description: {
    type: String
  },
  hospitalName: {
    type: String
  },
  hospitalContact: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'responded', 'completed', 'cancelled'],
    default: 'pending'
  },
  responders: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    name: String,
    bloodGroup: String,
    phone: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'on_way', 'arrived'],
      default: 'pending'
    },
    distance: Number,
    eta: Number // in minutes
  }],
  alertedHospitals: [{
    name: String,
    address: String,
    phone: String,
    distance: Number
  }],
  estimatedTime: {
    type: Number // in minutes
  },
  isAmbulanceDispatched: {
    type: Boolean,
    default: false
  },
  ambulanceDetails: {
    driverName: String,
    phone: String,
    vehicleNumber: String,
    eta: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

// Create index for location-based queries
emergencySchema.index({ location: '2dsphere' });
emergencySchema.index({ status: 1 });
emergencySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Emergency', emergencySchema);