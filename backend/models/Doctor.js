const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    credentials: {
      type: String,
      required: true
    },
    availability: {
      type: String,
      default: "Not Available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
