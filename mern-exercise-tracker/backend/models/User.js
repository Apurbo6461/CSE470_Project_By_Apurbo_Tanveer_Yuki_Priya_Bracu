const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['doctor', 'patient', 'donor', 'hospital', 'admin'], // Add 'donor' here
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
