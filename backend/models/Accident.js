const mongoose = require('mongoose');

const AccidentSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Reported', 'En-route', 'On-site', 'Resolved'],
    default: 'Reported'
  },
  description: {
    type: String,
    trim: true
  },
  time: {
    type: String, 
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Accident', AccidentSchema);