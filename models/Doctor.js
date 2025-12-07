const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  credentials: { type: String, required: true },
  availability: { type: [String], default: [] } // Array of time slots
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);