const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String }, // ✅ add this (optional)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['doctor', 'patient', 'donor', 'hospital', 'admin'],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
