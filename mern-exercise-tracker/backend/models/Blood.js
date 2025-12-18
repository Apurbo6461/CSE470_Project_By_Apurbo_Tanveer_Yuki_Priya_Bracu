// backend/models/Blood.js
const mongoose = require("mongoose");

const bloodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    bloodGroup: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    contactInfo: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blood", bloodSchema, "blooddonors");
