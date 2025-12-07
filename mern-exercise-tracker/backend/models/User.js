const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ROLE: one of 5 values
  role: {
    type: String,
    enum: ["patient", "doctor", "donor", "hospital", "admin"],
    default: "patient"
  }
});

module.exports = mongoose.model("User", userSchema);