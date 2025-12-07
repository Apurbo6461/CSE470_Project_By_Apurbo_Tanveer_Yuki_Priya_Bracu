const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// Create Doctor Profile
router.post("/create", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Availability
router.put("/availability/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true }
    );
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all doctors
router.get("/", async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

module.exports = router;